$(document).ready(function(){       
   var scroll_start = 0;
   var startchange = $('#startchange');
   var offset = startchange.offset();
    if (startchange.length){
   $(document).scroll(function() { 
      scroll_start = $(this).scrollTop();
      if(scroll_start > offset.top) {
          $('.navbar-nav').css('background-color', '#2B323C');
       } else {
          $('.navbar-nav').css('background-color', 'transparent');
       }
   });
    }
});