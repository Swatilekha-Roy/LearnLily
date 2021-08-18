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
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const IMAGE_URL = "https://teachablemachine.withgoogle.com/models/MQcSCaPs8/";

// Learn more about this API on https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose
const POSE_URL = "https://teachablemachine.withgoogle.com/models/gCKJy2yBv/";

// Learn more about this API on https://github.com/tensorflow/tfjs-models/tree/master/speech-commands
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

// Declare the arrays for storing dynamic data
let audio1arr,audio2arr,pose1arr,pose2arr,pose3arr,pose4arr,image1arr,image2arr,sumaudioarr1,sumaudioarr2,sumimagearr1,sumimagearr2,sumposearr1,sumposearr2,sumposearr3,sumposearr4;

// Load the image model and setup the webcam
async function init() {
    // Changing the button text
    document.querySelector("#record-btn").innerHTML = "Starting the magic...";

    const modelURLimage = IMAGE_URL + "model.json";
    const metadataURLimage = IMAGE_URL + "metadata.json";

    const modelURLpose = POSE_URL + "model.json";
    const metadataURLpose = POSE_URL + "metadata.json";

    console.log("loaded image and pose model");

    // load the model and metadata
    modelimage = await tmImage.load(modelURLimage, metadataURLimage);
    maxPredictionsimage = modelimage.getTotalClasses();
    // load the model and metadata
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

    // Change button text
    document.querySelector("#record-btn").innerHTML = "Loading the model...";

    await webcampose.setup(); // request access to the webcam
    //await webcamimage.setup();
    await webcampose.play();
    //await webcamimage.play();
    window.requestAnimationFrame(loop);

    // Change button text
    document.querySelector("#record-btn").innerHTML = "Please Be patient...";

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
        // declare the arrays empty
        audio1arr = []; 
        audio2arr = [];
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2)*100 + "%";
            audiolabelContainer.childNodes[i].innerHTML = classPrediction;
        }

        audio1arr.push(result.scores[0].toFixed(2)*100);
        audio2arr.push(result.scores[1].toFixed(2)*100);

        storedataaudio(audio1arr,audio2arr);
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

    // declare arrays empty
    image1arr = [];
    image2arr = [];

    // Image model texts
    imagelabelContainer.childNodes[0].innerHTML = predictionimage[0].className + ": " + predictionimage[0].probability.toFixed(2)*100 + "%";
    imagelabelContainer.childNodes[0].style.color = "#0dd840";
    imagelabelContainer.childNodes[1].innerHTML = predictionimage[1].className + ": " + predictionimage[1].probability.toFixed(2)*100 + "%";
    imagelabelContainer.childNodes[1].style.color = "#ee0a0a";

    // Store image data in array
    image1arr.push(predictionimage[0].probability.toFixed(2)*100);
    image2arr.push(predictionimage[1].probability.toFixed(2)*100);

    // Pose model texts        
    poselabelContainer.childNodes[0].innerHTML = predictionpose[0].className + ": " + predictionpose[0].probability.toFixed(2)*100 + "%";
    poselabelContainer.childNodes[0].style.color = "#0dd840"; //good eye contact
    poselabelContainer.childNodes[1].innerHTML = predictionpose[1].className + ": " + predictionpose[1].probability.toFixed(2)*100 + "%";
    poselabelContainer.childNodes[1].style.color = "#ee0a0a"; //bad eye contact
    poselabelContainer.childNodes[2].innerHTML = predictionpose[2].className + ": " + predictionpose[2].probability.toFixed(2)*100 + "%";
    poselabelContainer.childNodes[2].style.color = "#ee0a0a"; //fidgeting
    poselabelContainer.childNodes[3].innerHTML = predictionpose[3].className + ": " + predictionpose[3].probability.toFixed(3)*100 + "%";
    poselabelContainer.childNodes[3].style.color = "#ee0a0a"; //slump

    // declare empty arrays
    pose1arr = [];
    pose2arr = [];
    pose3arr = [];
    pose4arr = [];

    // Store pose data in array
    pose1arr.push(predictionpose[0].probability.toFixed(2)*100);
    pose2arr.push(predictionpose[1].probability.toFixed(2)*100);
    pose3arr.push(predictionpose[2].probability.toFixed(2)*100);
    pose4arr.push(predictionpose[3].probability.toFixed(2)*100);

    storedatapose(image1arr,image2arr,pose1arr,pose2arr,pose3arr,pose4arr);
 
    // finally draw the poses
    drawPose(pose);
}

// Manipulate the data arrays and do calculations
function storedataaudio(audio1arr,audio2arr)
{
    sumaudioarr1=0; 
    sumaudioarr2=0;

    // audio array calculations
    for(i=0; i<audio1arr.length; i++)
    {       
        sumaudioarr1 += (audio1arr[i]);
    }
       
    for(i=0; i<audio2arr.length; i++)
    {
        sumaudioarr2 += audio2arr[i];
    }
}

function storedatapose(image1arr,image2arr,pose1arr,pose2arr,pose3arr,pose4arr)
{   
    sumimagearr1=0;
    sumimagearr2=0;
    sumposearr1=0;
    sumposearr2=0; 
    sumposearr3=0; 
    sumposearr4=0;

    // image array calculations
    for(i=0; i<image1arr.length; i++)
    {
        sumimagearr1 += image1arr[i];
    }
    for(i=0; i<image2arr.length; i++)
    {
        sumimagearr2 += image2arr[i];
    }

    // pose array calculations
    for(i=0; i<pose1arr.length; i++)
    {
        sumposearr1 += pose1arr[i];
    }    
    for(i=0; i<pose2arr.length; i++)
    {
        sumposearr2 += pose2arr[i];
    }
    for(i=0; i<pose3arr.length; i++)
    {
        sumposearr3 += pose3arr[i];
    }
    for(i=0; i<pose4arr.length; i++)
    {
        sumposearr4 += pose4arr[i];
    }
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
    sumaudioarr1 /= audio1arr.length;
    sumimagearr2 /= audio2arr.length;
    console.log(sumaudioarr1 + " " + sumaudioarr2);
    sumimagearr1 /= image1arr.length;
    sumimagearr2 /= image2arr.length;
    sumposearr1 /= pose1arr.length;
    sumposearr2 /= pose2arr.length;
    sumposearr3 /= pose3arr.length;
    sumposearr4 /= pose4arr.length;
    console.log(sumimagearr1 + " " + sumimagearr2);
    console.log(sumposearr1 + " " + sumposearr2 + " " + sumposearr3 + " " + sumposearr4);

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
var i,gli,grsentence1,grsentence2,grsentence3,grspansentence2,grissuetype,grbr,grbr2,grperiod,grperiod2,grspanissuetype,grshortmessage1,grshortmessage2,grspanshortmessage2,grmessage1,grmessage2,grspanmessage2;

function printreport(matches)
{
    document.querySelector(".grammar-h").style.display = "block";

    for(i=0; i<matches.length; i++)
    {  
        grli = document.createElement("li");

        grsentence1 = document.createTextNode("In this sentence \"");
        grli.appendChild(grsentence1);

        grsentence2 = document.createTextNode(matches[i].sentence);
        grspansentence2 = document.createElement("span");
        grspansentence2.setAttribute("style", "font-style: italic; font-weight: 600;");
        grspansentence2.appendChild(grsentence2);
        grli.appendChild(grspansentence2);

        grsentence3 = document.createTextNode("\" there is possible error related to \"");
        grli.appendChild(grsentence3);

        grissuetype = document.createTextNode(matches[i].rule.issueType);
        grspanissuetype = document.createElement("span");
        grspanissuetype.setAttribute("style", "color: #ed143d; font-weight:600;");
        grspanissuetype.appendChild(grissuetype);
        grli.appendChild(grspanissuetype);
        
        grperiod = document.createTextNode("\".");       
        grperiod2 = grperiod.cloneNode(true);
        grli.appendChild(grperiod);

        grbr = document.createElement("br");
        grbr2 = grbr.cloneNode(true);
        grbr3 = grbr.cloneNode(true);

        grli.appendChild(grbr);

        if(matches[i].shortMessage !== "")
        {
            grshortmessage1 = document.createTextNode("Error brief: \"");
            grli.appendChild(grshortmessage1);

            grshortmessage2 = document.createTextNode(matches[i].shortMessage);
            grspanshortmessage2 = document.createElement("span");
            grspanshortmessage2.setAttribute("style", "font-weight: 600;");
            grspanshortmessage2.appendChild(grshortmessage2);
            grli.appendChild(grspanshortmessage2);

            grli.appendChild(grperiod2);

            grli.appendChild(grbr2);
        }

        grmessage1 = document.createTextNode("Error Solution: ");
        grli.appendChild(grmessage1);

        grmessage2 = document.createTextNode(matches[i].message+".");
        grspanmessage2 = document.createElement("span");
        grspanmessage2.setAttribute("style", "color: #249a0e; font-weight:600; font-style: italic;");
        grspanmessage2.appendChild(grmessage2);
        grli.appendChild(grspanmessage2);

        document.querySelector(".gr-report").appendChild(grli);
        document.querySelector(".gr-report").appendChild(grbr3);
    }
}
