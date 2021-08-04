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



/* Teachable ML model */
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    // the link to your model provided by Teachable Machine export panel
    const IMAGE_URL = "https://teachablemachine.withgoogle.com/models/MQcSCaPs8/";

    // Learn more about this API on https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose
    const POSE_URL = "https://teachablemachine.withgoogle.com/models/gCKJy2yBv/";

    // Learn more about this API on https://github.com/tensorflow/tfjs-models/tree/master/speech-commands
    // the link to your model provided by Teachable Machine export panel
    const AUDIO_URL = "https://teachablemachine.withgoogle.com/models/1jaFMEKV8/";

    let modelimage, webcamimage, imagelabelContainer, maxPredictionsimage;
    let modelpose, webcampose, ctx, poselabelContainer, maxPredictionspose;

    console.log("loaded models");

    // for audio model
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
            console.log("loaded audio model");

            return recognizer;
    }




    // Load the image model and setup the webcam
    async function init() {

        const modelURLimage = IMAGE_URL + "model.json";
        const metadataURLimage = IMAGE_URL + "metadata.json";
        const modelURLpose = POSE_URL + "model.json";
        const metadataURLpose = POSE_URL + "metadata.json";

        console.log("loaded image and pose model");

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        modelimage = await tmImage.load(modelURLimage, metadataURLimage);
        maxPredictionsimage = modelimage.getTotalClasses();
        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // Note: the pose library adds a tmPose object to your window (window.tmPose)
        modelpose = await tmPose.load(modelURLpose, metadataURLpose);
        maxPredictionspose = modelpose.getTotalClasses();

        console.log("await tmPose and tmImage and maxPredictions counted");

        // Convenience function to setup a webcam
        const height = 350;
        const width = 350;
        const flip = true; // whether to flip the webcam
        
        webcamimage = new tmImage.Webcam(width, height, flip); // width, height, flip
        webcampose = new tmPose.Webcam(width, height, flip); // width, height, flip

        console.log("webcam instance created");

        await webcampose.setup(); // request access to the webcam
        //await webcamimage.setup();
        await webcampose.play();
        //await webcamimage.play();
        window.requestAnimationFrame(loop);

        console.log("webcam setup and play done");

        // append elements to the DOM
        const canvas = document.getElementById("canvas");
        canvas.width = width; canvas.height = height;
        ctx = canvas.getContext("2d");
        
        poselabelContainer = document.getElementById("pose_label-container");
        for (let i = 0; i < maxPredictionspose; i++) { // and class labels
            poselabelContainer.appendChild(document.createElement("div"));
        }

        console.log("pose container sub divs made");

        imagelabelContainer = document.getElementById("image_label-container");
        for (let i = 0; i < maxPredictionsimage; i++) { // and class labels
            imagelabelContainer.appendChild(document.createElement("div"));
        }

        console.log("image container sub divs made");

         // audio recogniser
        const recognizer = await createModel();
        const classLabels = recognizer.wordLabels(); // get class labels
        const audiolabelContainer = document.getElementById("audio_label-container");
        for (let i = 0; i < classLabels.length; i++) {
            audiolabelContainer.appendChild(document.createElement("div"));
        }

        console.log("audio container sub divs made");

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

            console.log("audio classes fetched and printed");

            // Stop the recognition in 5 seconds.
            // setTimeout(() => recognizer.stopListening(), 5000);

            // Change Button text
            document.querySelector("#record-btn").innerHTML = "Recording...";
            document.querySelector("#speech-report").style.display = "block";
            document.querySelector("#record-btn").style.float = "none";
            document.querySelector("#stop-record-btn").style.display = "inline-block";

            console.log("page orientations changed");
    }

    async function loop() {
        webcampose.update(); // update the webcam frame
        webcamimage.update();
        await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // Prediction #1: run input through posenet
        // estimatePose can take in an image, video or canvas html element
        const { pose, posenetOutput } = await modelpose.estimatePose(webcampose.canvas);
        // Prediction 2: run input through teachable machine classification model
        const predictionpose = await modelpose.predict(posenetOutput);
        // predict can take in an image, video or canvas html element
        const predictionimage = await modelimage.predict(webcampose.canvas);

        // Image model texts
        imagelabelContainer.childNodes[0].innerHTML = predictionimage[0].className + ": " + predictionimage[0].probability.toFixed(2)*100 + "%";
        imagelabelContainer.childNodes[0].style.color = "#0dd840";
        imagelabelContainer.childNodes[0].style.fontWeight = 700;
        imagelabelContainer.childNodes[1].innerHTML = predictionimage[1].className + ": " + predictionimage[1].probability.toFixed(2)*100 + "%";
        imagelabelContainer.childNodes[1].style.color = "#ee0a0a";
        imagelabelContainer.childNodes[1].style.fontWeight = 700;


        for (let i = 0; i < maxPredictionspose; i++) {
        const classPrediction = predictionpose[i].className + ": " + predictionpose[i].probability.toFixed(2);
        poselabelContainer.childNodes[i].innerHTML = classPrediction;
        }

        // finally draw the poses
        drawPose(pose);
    }

function drawPose(pose) {
if (webcampose.canvas) {
    ctx.drawImage(webcampose.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

async function initstop()
{
    await webcampose.stop();
    //recognizer.stopListening();
    document.querySelector("#record-btn").innerHTML = "Start Recording";
}
