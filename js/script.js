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
	alert('Logged Out from LearnLily! :(');
	
	// REDIRECTS THE USER TO THE HOMEPAGE
	location.href = '/~/LearnLily/landpage'
}