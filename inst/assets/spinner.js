(function() {
var output_states = {};
var timeoutHandles = {};

function escapeSelector(s) {
    return s.replace(/([!"#$%&'()*+,-./:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
}

function show_spinner(id) {
    var selector = "#" + escapeSelector(id);
    var parent = $(selector).closest(".shiny-spinner-output-container");

    if (parent && parent.length && timeoutHandles[parent] === null) {
      var delay = parent.data() && parent.data().showdelay ? parent.data().showdelay : 0;
      timeoutHandles[parent] = setTimeout(function(){
          timeoutHandles[parent] = null;
          var currentHeight = parent.height();
          
          $(selector).siblings(".load-container, .shiny-spinner-placeholder").removeClass('shiny-spinner-hidden');
      
          if (parent.hasClass("shiny-spinner-hideui")) {
            $(selector).siblings(".load-container").siblings('.shiny-bound-output, .shiny-output-error')
            .css('visibility', 'hidden');
            
            if (parent.hasClass("shiny-spinner-keepheight") && currentHeight) parent.css("height", currentHeight + "px");
      
            // if there is a proxy div, hide the previous output
            $(selector).siblings(".shiny-spinner-placeholder").siblings('.shiny-bound-output, .shiny-output-error').addClass('shiny-spinner-hidden');
          }
        
      }, delay);
  
    }
}

function hide_spinner(id) {
    var selector = "#" + escapeSelector(id);
    var parent = $(selector).closest(".shiny-spinner-output-container");
    
    if (parent && parent.length &&  timeoutHandles[parent] !== null) {
      clearTimeout(timeoutHandles[parent]);
      timeoutHandles[parent] = null;
    }
    
    $(selector).siblings(".load-container, .shiny-spinner-placeholder").addClass('shiny-spinner-hidden');
    if (parent.hasClass("shiny-spinner-hideui")) {
      
      $(selector).siblings(".load-container").siblings('.shiny-bound-output').css('visibility', 'visible');
      
      if (parent.hasClass("shiny-spinner-keepheight")) parent.css("height", "");
      
      // if there is a proxy div, show the previous output in case it was hidden
      $(selector).siblings(".shiny-spinner-placeholder").siblings('.shiny-bound-output').removeClass('shiny-spinner-hidden');
    }
}

function update_spinner(id) {
  if (!(id in output_states)) {
    show_spinner(id);
  }
  if (output_states[id] <= 0) {
    show_spinner(id);
  } else {
    hide_spinner(id);
  }
}

$(document).on('shiny:bound', function(event) { 
  var id = event.target.id;
  if (id === undefined || id == "") {
    return;
  }
  
  /* if not bound before, then set the value to 0 */
  if (!(id in output_states)) {
    output_states[id] = 0;
  }
  update_spinner(id);
});

/* When recalculating starts, show the spinner container & hide the output */
$(document).on('shiny:outputinvalidated', function(event) {
  var id = event.target.id;
  if (id === undefined) {
    return;
  }
  output_states[id] = 0;
  update_spinner(id);
});

/* When new value or error comes in, hide spinner container (if any) & show the output */
$(document).on('shiny:value shiny:error', function(event) {
  var id = event.target.id;
  if (id === undefined) {
    return;
  }
  output_states[id] = 1;
  update_spinner(id);
});
}());
