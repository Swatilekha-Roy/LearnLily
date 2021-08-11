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

    // fetch('audiomodel.js').then(function (response) {
    //     return response.json();
    //  }).then(function (obj) {
    //    console.log(obj);
    //    console.log(obj.address);
    //  }).catch(function (error) {
    //    console.log("Something went wrong retriving JSON file");
    //    console.log(error);
    //  })

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
            //document.querySelector("#record-btn").style.float = "none";
            document.querySelector("#stop-record-btn").style.display = "inline-block";
            document.querySelector("#canvas").style.display = "block";

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
        imagelabelContainer.childNodes[1].innerHTML = predictionimage[1].className + ": " + predictionimage[1].probability.toFixed(2)*100 + "%";
        imagelabelContainer.childNodes[1].style.color = "#ee0a0a";

        // Pose model texts
        poselabelContainer.childNodes[0].innerHTML = predictionpose[0].className + ": " + predictionpose[0].probability.toFixed(2)*100 + "%";
        poselabelContainer.childNodes[0].style.color = "#0dd840"; //good eye contact
        poselabelContainer.childNodes[1].innerHTML = predictionpose[1].className + ": " + predictionpose[1].probability.toFixed(2)*100 + "%";
        poselabelContainer.childNodes[1].style.color = "#ee0a0a"; //bad eye contact
        poselabelContainer.childNodes[2].innerHTML = predictionpose[2].className + ": " + predictionpose[2].probability.toFixed(2)*100 + "%";
        poselabelContainer.childNodes[2].style.color = "#ee0a0a"; //fidgeting
        poselabelContainer.childNodes[3].innerHTML = predictionpose[3].className + ": " + predictionpose[3].probability.toFixed(3)*100 + "%";
        poselabelContainer.childNodes[3].style.color = "#ee0a0a"; //slump
        

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



/* Google Calender API */



/* Essay Grammar Check */
// Send text from textbox to browser
let text,quotes_text;

function sendessay()
{
    textessay = document.querySelector("#essay-text").value;
    //quotes_text = textessay.replace(/["]+/g,'\"');

    // Grammar checker tool
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://dnaber-languagetool.p.rapidapi.com/v2/check",
        "method": "POST",
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "x-rapidapi-key": "7435682d81msh80bb1a3c307cfb3p120bd9jsn6c2c4d095820",
            "x-rapidapi-host": "dnaber-languagetool.p.rapidapi.com"
        },
        "data": {
            "text": textessay,
            //"markup": "\"\"",
            "language": "en-US"
        },
        
    };
    settings.text = quotes_text;

    $.ajax(settings).done(function (response) {
        console.log(response.matches);

        // calls function to print result
        printreport(response.matches);
    });   
}

// prints grammar report to page
var grmessage,grsentence,grissuetype,grshortmessage,grli;
function printreport(matches)
{
    for(i=0; i<matches.length; i++)
    {
        //console.log(matches[i].context);
        //grtext = matches[i].context.text;       
        grsentence = document.createTextNode("In this sentence \"" + matches[i].sentence + "\" there is possible error related to ");
        grmessage = document.createTextNode(matches[i].message+"\n\n");
        grissuetype = document.createTextNode("\"" + matches[i].rule.issueType + "\" \n");
        //grissuetype.style.color = "red";

        grli = document.createElement("li");
        grli.setAttribute("style", "color: green;");
        //grli.setAttribute("id", "idgrli");
        //document.querySelector("#idgrli").style.color = "red";

        grli.appendChild(grsentence);
        grli.appendChild(grissuetype);
        if(matches[i].shortMessage !== undefined)
        {
            grshortmessage = document.createTextNode(matches[i].shortMessage);
            grli.appendChild(grshortmessage);
        }
        grli.appendChild(grmessage);
        document.querySelector(".gr-report").appendChild(grli);
        //document.querySelector(".gr-report").textContent += matches[i].context.text;
    }
}
