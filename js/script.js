/* Scroll to top arrow */
$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {        
        $('#return-to-top').fadeIn(200);    
    } else {
        $('#return-to-top').fadeOut(200);   
    }
});
$('#return-to-top').click(function() {      
    $('body,html').animate({
        scrollTop : 0                       
    }, 500);
});



/* Logout functionality */
window.logout = function() {

	// TELLS OUR SERVER TO LOG THE USER OUT
	fetch('/~/LearnLily/logout', { method: 'POST'});
	
	// TELLS OUR BROWSER TO SHOW A MESSAGE TO OUR USER
	alert('Logged Out!');
	
	// REDIRECTS THE USER TO THE HOMEPAGE
	location.href = '/~/LearnLily/landpage'
}



/* Teachable Machine ML Model */
// Learn more about this API on https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose
const URL = "https://teachablemachine.withgoogle.com/models/gCKJy2yBv/";
let model, webcam, ctx, labelContainer, maxPredictions;

// Learn more about this API on https://github.com/tensorflow/tfjs-models/tree/master/speech-commands
// the link to your model provided by Teachable Machine export panel
const AUDIO_URL = "https://teachablemachine.withgoogle.com/models/1jaFMEKV8/";

async function createModel() {
    const checkpointURL = AUDIO_URL + "model.json"; // model topology
    const metadataURL = AUDIO_URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

        // check that model and metadata are loaded via HTTPS requests.
        await recognizer.ensureModelLoaded();

        return recognizer;
}


async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const height = 350;
    const width = 400;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(width, height, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = width; canvas.height = height;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const audiolabelContainer = document.getElementById("audio_label-container");
    for (let i = 0; i < classLabels.length; i++) {
        audiolabelContainer.appendChild(document.createElement("div"));
    }

    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(result => {
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
            audiolabelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }, {
            includeSpectrogram: true, // in case listen should return result.spectrogram
            probabilityThreshold: 0.75,
            invokeCallbackOnNoiseAndUnknown: true,
            overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
        });

        // Stop the recognition in 5 seconds.
        // setTimeout(() => recognizer.stopListening(), 5000);

        // Change Button text
        document.querySelector("#record-btn").innerHTML = "Recording...";
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

    

async function startCapture(displayMediaOptions) {
    let captureStream = null;
  
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err) {
      console.error("Error: " + err);
    }
    return captureStream;
  }