/* Word, paragraph, character, etc. count */
var input = document.querySelectorAll('textarea')[0],
  characterCount = document.querySelector('#characterCount'),
  wordCount = document.querySelector('#wordCount'),
  sentenceCount = document.querySelector('#sentenceCount'),
  paragraphCount = document.querySelector('#paragraphCount'),
  readingTime = document.querySelector('#readingTime'),
  readability = document.querySelector('#readability'),
  keywordsDiv = document.querySelectorAll('.keywords')[0],
  topKeywords = document.querySelector('#topKeywords');

// updating the displayed stats after every keypress
input.addEventListener('keyup', function() {

  characterCount.innerHTML = input.value.length;

  var words = input.value.match(/\b[-?(\w+)?]+\b/gi);
  if (words) {
    wordCount.innerHTML = words.length;
  } else {
    wordCount.innerHTML = 0;
  }

  // sentence count	using ./!/? as sentense separators
  if (words) {
    var sentences = input.value.split(/[.|!|?]+/g);
    sentenceCount.innerHTML = sentences.length - 1;
  } else {
    sentenceCount.innerHTML = 0;
  }

  // paragraph count from http://stackoverflow.com/a/3336537
  if (words) {

    var paragraphs = input.value.replace(/\n$/gm, '').split(/\n/);
    paragraphCount.innerHTML = paragraphs.length;
  } else {
    paragraphCount.innerHTML = 0;
  }

  // reading time based on 275 words/minute
  if (words) {
    var seconds = Math.floor(words.length * 60 / 275);
    // need to convert seconds to minutes and hours
    if (seconds > 59) {
      var minutes = Math.floor(seconds / 60);
      seconds = seconds - minutes * 60;
      readingTime.innerHTML = minutes + "m " + seconds + "s";
    } else {
      readingTime.innerHTML = seconds + "s";
    }
  } else {
    readingTime.innerHTML = "0s";
  }

  if (words) {

    // step-1: removing all the stop words
    var nonStopWords = [];
    var stopWords = ["a", "able", "about", "above", "abst", "accordance", "according", "accordingly", "across", "act", "actually", "added", "adj", "affected", "affecting", "affects", "after", "afterwards", "again", "against", "ah", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "announce", "another", "any", "anybody", "anyhow", "anymore", "anyone", "anything", "anyway", "anyways", "anywhere", "apparently", "approximately", "are", "aren", "arent", "arise", "around", "as", "aside", "ask", "asking", "at", "auth", "available", "away", "awfully", "b", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "begin", "beginning", "beginnings", "begins", "behind", "being", "believe", "below", "beside", "besides", "between", "beyond", "biol", "both", "brief", "briefly", "but", "by", "c", "ca", "came", "can", "cannot", "can't", "cause", "causes", "certain", "certainly", "co", "com", "come", "comes", "contain", "containing", "contains", "could", "couldnt", "d", "date", "did", "didn't", "different", "do", "does", "doesn't", "doing", "done", "don't", "down", "downwards", "due", "during", "e", "each", "ed", "edu", "effect", "eg", "eight", "eighty", "either", "else", "elsewhere", "end", "ending", "enough", "especially", "et", "et-al", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "except", "f", "far", "few", "ff", "fifth", "first", "five", "fix", "followed", "following", "follows", "for", "former", "formerly", "forth", "found", "four", "from", "further", "furthermore", "g", "gave", "get", "gets", "getting", "give", "given", "gives", "giving", "go", "goes", "gone", "got", "gotten", "h", "had", "happens", "hardly", "has", "hasn't", "have", "haven't", "having", "he", "hed", "hence", "her", "here", "hereafter", "hereby", "herein", "heres", "hereupon", "hers", "herself", "hes", "hi", "hid", "him", "himself", "his", "hither", "home", "how", "howbeit", "however", "hundred", "i", "id", "ie", "if", "i'll", "im", "immediate", "immediately", "importance", "important", "in", "inc", "indeed", "index", "information", "instead", "into", "invention", "inward", "is", "isn't", "it", "itd", "it'll", "its", "itself", "i've", "j", "just", "k", "keep", "keeps", "kept", "kg", "km", "know", "known", "knows", "l", "largely", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "lets", "like", "liked", "likely", "line", "little", "'ll", "look", "looking", "looks", "ltd", "m", "made", "mainly", "make", "makes", "many", "may", "maybe", "me", "mean", "means", "meantime", "meanwhile", "merely", "mg", "might", "million", "miss", "ml", "more", "moreover", "most", "mostly", "mr", "mrs", "much", "mug", "must", "my", "myself", "n", "na", "name", "namely", "nay", "nd", "near", "nearly", "necessarily", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "ninety", "no", "nobody", "non", "none", "nonetheless", "noone", "nor", "normally", "nos", "not", "noted", "nothing", "now", "nowhere", "o", "obtain", "obtained", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "omitted", "on", "once", "one", "ones", "only", "onto", "or", "ord", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "owing", "own", "p", "page", "pages", "part", "particular", "particularly", "past", "per", "perhaps", "placed", "please", "plus", "poorly", "possible", "possibly", "potentially", "pp", "predominantly", "present", "previously", "primarily", "probably", "promptly", "proud", "provides", "put", "q", "que", "quickly", "quite", "qv", "r", "ran", "rather", "rd", "re", "readily", "really", "recent", "recently", "ref", "refs", "regarding", "regardless", "regards", "related", "relatively", "research", "respectively", "resulted", "resulting", "results", "right", "run", "s", "said", "same", "saw", "say", "saying", "says", "sec", "section", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sent", "seven", "several", "shall", "she", "shed", "she'll", "shes", "should", "shouldn't", "show", "showed", "shown", "showns", "shows", "significant", "significantly", "similar", "similarly", "since", "six", "slightly", "so", "some", "somebody", "somehow", "someone", "somethan", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specifically", "specified", "specify", "specifying", "still", "stop", "strongly", "sub", "substantially", "successfully", "such", "sufficiently", "suggest", "sup", "sure", "t", "take", "taken", "taking", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "that'll", "thats", "that've", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "thered", "therefore", "therein", "there'll", "thereof", "therere", "theres", "thereto", "thereupon", "there've", "these", "they", "theyd", "they'll", "theyre", "they've", "think", "this", "those", "thou", "though", "thoughh", "thousand", "throug", "through", "throughout", "thru", "thus", "til", "tip", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "ts", "twice", "two", "u", "un", "under", "unfortunately", "unless", "unlike", "unlikely", "until", "unto", "up", "upon", "ups", "us", "use", "used", "useful", "usefully", "usefulness", "uses", "using", "usually", "v", "value", "various", "'ve", "very", "via", "viz", "vol", "vols", "vs", "w", "want", "wants", "was", "wasn't", "way", "we", "wed", "welcome", "we'll", "went", "were", "weren't", "we've", "what", "whatever", "what'll", "whats", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "wheres", "whereupon", "wherever", "whether", "which", "while", "whim", "whither", "who", "whod", "whoever", "whole", "who'll", "whom", "whomever", "whos", "whose", "why", "widely", "willing", "wish", "with", "within", "without", "won't", "words", "world", "would", "wouldn't", "www", "x", "y", "yes", "yet", "you", "youd", "you'll", "your", "youre", "yours", "yourself", "yourselves", "you've", "z", "zero"];
    for (var i = 0; i < words.length; i++) {
      // filtering out stop words and numbers
      if (stopWords.indexOf(words[i].toLowerCase()) === -1 && isNaN(words[i])) {
        nonStopWords.push(words[i].toLowerCase());
      }
    }
    // console.log(nonStopWords);

    // step-2: forming an object with keywords and their count
    var keywords = {};
    for (var i = 0; i < nonStopWords.length; i++) {
      // checking if the word(property) already exists
      // if it does increment the count otherwise set it to one
      if (nonStopWords[i] in keywords) {
        keywords[nonStopWords[i]] += 1;
      } else {
        keywords[nonStopWords[i]] = 1;
      }
    }

    // step-3: sorting the object by first converting it to a 2D array
    var sortedKeywords = [];
    for (var keyword in keywords) {
      sortedKeywords.push([keyword, keywords[keyword]])
    }
    sortedKeywords.sort(function(a, b) {
      return b[1] - a[1]
    });
    // console.log(sortedKeywords);

    // step-4: displaying top 4 keywords and their count
    topKeywords.innerHTML = "";
    for (var i = 0; i < sortedKeywords.length && i < 4; i++) {
      var li = document.createElement('li');
      li.innerHTML = "<b>" + sortedKeywords[i][0] + "</b>: " + sortedKeywords[i][1];
      topKeywords.appendChild(li);
    }
  }

  // displaying top keywords only if there is a word in the text area
  if (words) {
    keywordsDiv.style.display = "block";
  } else {
    keywordsDiv.style.display = "none";
  }

});

// readability level using readability-metrics API from Mashape
readability.addEventListener('click', function() {

  // placeholder until the API returns the score  
  readability.innerHTML = "Fetching score...";
  
  const settings = {
	"async": true,
	"crossDomain": true,
	"url": "https://ipeirotis-readability-metrics.p.rapidapi.com/getReadabilityMetrics?text=The%20word%20logorrhoea%20is%20often%20used%20pejoratively%20%20to%20describe%20prose%20that%20is%20highly%20abstract%20and%20%20contains%20little%20concrete%20language.%20Since%20abstract%20%20writing%20is%20hard%20to%20visualize%2C%20it%20often%20seems%20as%20though%20%20it%20makes%20no%20sense%20and%20all%20the%20words%20are%20excessive.%20%20Writers%20in%20academic%20fields%20that%20concern%20themselves%20mostly%20%20with%20the%20abstract%2C%20such%20as%20philosophy%20and%20especially%20%20postmodernism%2C%20often%20fail%20to%20include%20extensive%20concrete%20%20examples%20of%20their%20ideas%2C%20and%20so%20a%20superficial%20examination%20%20of%20their%20work%20might%20lead%20one%20to%20believe%20that%20it%20is%20all%20nonsense.",
	"method": "POST",
	"headers": {
		"x-rapidapi-host": "ipeirotis-readability-metrics.p.rapidapi.com",
		"x-rapidapi-key": "7435682d81msh80bb1a3c307cfb3p120bd9jsn6c2c4d095820"
		}
	};

	$.ajax(settings).done(function (response) {
	    readability.innerHTML = readingEase(response.FLESCH_READING);
	    
	});
});

// function to convert FLESCH READING SCORE into meaningful string.
function readingEase(num) {
  switch (true) {
    case (num <= 30):
      return "Readability: College graduate.";
      break;
    case (num > 30 && num <= 50):
      return "Readability: College level.";
      break;
    case (num > 50 && num <= 60):
      return "Readability: 10th - 12th grade.";
      break;
    case (num > 60 && num <= 70):
      return "Readability: 8th - 9th grade.";
      break;
    case (num > 70 && num <= 80):
      return "Readability: 7th grade.";
      break;
    case (num > 80 && num <= 90):
      return "Readability: 6th grade.";
      break;
    case (num > 90 && num <= 100):
      return "Readability: 5th grade.";
      break;
    default:
      return "Not available.";
      break;
  }
}

window.textessay;

/* Essay Grammar Check */
// Send text from textbox to browser
let text,quotes_text;

function sendessay()
{
	textessay = document.querySelector(".ess-txt").value;
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
            "language": "en-US"
        },
        
    };
    settings.text = quotes_text;

    $.ajax(settings).done(function (response) {

        // calls function to print result
        printreport(response.matches);
    });   
}

// prints grammar report to page
var i,gli,grsentence1,grsentence2,grsentence3,grspansentence2,grissuetype,grbr,grbr2,grperiod,grperiod2,grspanissuetype,grshortmessage1,grshortmessage2,grspanshortmessage2,grmessage1,grmessage2,grspanmessage2;

function printreport(matches)
{
    document.querySelector(".grammar-h").style.display = "block";
    
    if(matches.length === 0)
    {
    	document.querySelector(".gr-report").innerHTML = "Congrats Wren and Martin, we didn't find any errors!";
    	document.querySelector(".gr-report").style.color = "#249a0e";
    }

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