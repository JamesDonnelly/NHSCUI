/* global moment */
var nhscui = {};

// Ensure the console doesn't throw errors if not defined.
if (!console || typeof console != "object")
  console = { info: function() { } };
else if (!console.info)
  console.info = function() { }

/* Patient Name Display.
 * Related documentation:
 * -> Patient Name Display (http://systems.hscic.gov.uk/data/cui/uig/patnamedisp.pdf)
 */

/* Patient Name Display 2.1 - Patient Name Display.
 * This function takes the title, forname and surname and returns it in NHS format
 * (e.g. SMITH, John (Mr)).
 */
nhscui.toPatientName = function(title, forename, surname) {  
  if (!forename || typeof forename != 'string') {
    console.info("Patient forename(s) must be provided and must be in String format.");
    console.info("http://systems.hscic.gov.uk/data/cui/uig/patnamedisp.pdf; section 2.1.");
    
    // Convert it to a string anyway, to circumvent errors.
    forename = "–";
  }
  
  if (!surname || typeof surname != 'string') {
    console.info("Patient surname(s) must be provided and must be in String format.");
    console.info("http://systems.hscic.gov.uk/data/cui/uig/patnamedisp.pdf; section 2.1.");
    
    // Convert it to a string anyway, to circumvent errors.
    surname = "–";
  }
  
  // Wrap the title in parenthesis.
  // There's an open issue about this: https://github.com/JamesDonnelly/NHSCUI/issues/1
  title = title ?  title : "Unspecified";
  
  // Convert the surname to uppercase.
  surname = surname.toUpperCase();

  return surname + ", " + forename + ' (' + title + ')';
}

/* Date and Time Display.
 * Related documentation:
 * -> Date Display (http://systems.hscic.gov.uk/data/cui/uig/datedisplay.pdf)
 * -> Time Display (http://systems.hscic.gov.uk/data/cui/uig/timedisplay.pdf)
 * -> Date and Time Display QIG (http://systems.hscic.gov.uk/data/cui/uig/datetimedispqig.pdf)
 * 
 * Dependencies:
 * -> Moment.js (http://momentjs.com, https://github.com/moment/moment)
 */

/* Before we do anything else we need to configure Moment.js to conform to the NHS CUI
 * documentation. The locale needs to be English; weeks need to start on Monday; and date ordinals
 * need to be displayed in superscript.
 */
moment.locale('en', {
    ordinal: function(n) {
      /* This customises MomentJS to wrap date suffixes in <sup> tags.
        * http://momentjs.com/docs/#/customization/ordinal
        */
      var b = n % 10,
          o = (~~(n % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
      return n + '<sup>' + o + '</sup>'
    }
});

// Init the date wrapper.
var date = {};

/* Validate a date.
 * This function is used to ensure dates are valid. If "Not Recorded" is passed into one of the
 * below date functions this ensures that "Not recorded" is returned. Furthermore if Moment.js is
 * unable to process the date and the former is not true, "Unknown" will be returned.
 */
function validateDate(d) {
  if (typeof d == 'string' && d.toLowerCase() == "invalid date")
      return "Unknown";
  
  return d;
}

/* Date Display 2.2 - Short Date Format.
 * Convert input date to Short Date Format string with optional parameter used to show the
 * short-form day (e.g. 09-Sep-2008, Tue 09-Sep-2008).
 * 
 * -> nhscui.toShortDate( date )                                                      "09-Sep-2008"
 * -> nhscui.toShortDate( date , true)                                            "Tue 09-Sep-2008"
 */
date.toShortDate = function(date, showDay) {
  if (typeof date == 'string')
    if (date.toLowerCase() == "not recorded")
      return "Not recorded";
    else
      // Ensure <sup> tags and date ordinals are removed as Moment.js can't handle these.
      date = date.replace('<sup>','').replace('</sup>', '').replace(/th|nd|st|rd/gi, '');
    
  return validateDate(moment(date).format(
    (showDay ? 'ddd ' : '') + 
    'DD MMM YYYY'
  ));
}

/* Date Display 2.3 - Long Date Format.
 * Convert input date to Long Date Format string with optional parameters used to show the
 * long-form day (e.g. 09 September 2008, Tue 09 September 2008, 9th September 2008).
 * 
 * -> nhscui.toLongDate( date )                                                 "09 September 2008"
 * -> nhscui.toLongDate( date , true)                                       "Tue 09 September 2008"
 * -> nhscui.toLongDate( date , false, true)                        "9<sup>th</sup> September 2008"
 * -> nhscui.toLongDate( date , true, true)                     "Tue 9<sup>th</sup> September 2008"
 */
date.toLongDate = function(date, showDay, showOrdinal) {
  if (typeof date == 'string')
    if (date.toLowerCase() == "not recorded")
      return "Not recorded";
    else
      // Ensure <sup> tags and date ordinals are removed as Moment.js can't handle these.
      date = date.replace('<sup>','').replace('</sup>', '').replace(/th|nd|st|rd/gi, '');
    
  return validateDate(moment(date).format(
    (showDay ? 'ddd ' : '') + 
    (showOrdinal ? 'Do' : 'DD') +
    ' MMMM YYYY'
  ));
}

// Add the wrapper to the nhscui object. nhscui.date.fn(...)
nhscui.date = date;