/***
!! Note
* @@color:red;This is a development snapshot which may or may not function properly.@@

|editable|k
|''Name:''|twve.core|
|''Description:''|Core codes of twve, the ~TiddlyWiki View mode Editor, providing easy access to the defining wiki text corresponding to a DOM element, and the synchronization capability for multiply transcluded copies of a tiddler.|
|''Author:''|Vincent Yeh (qmo.wcy2@gmail.com)|
|''Source:''|* (minimized) http://twve.tiddlyspace.com/#twve.core.min <br>* (regular) http://twve.tiddlyspace.com/#twve.core|
|''Type:''|plugin|
|''Version:''|3.0.0|
|''Status:''|This plugin is still under development.<br>You are welcome to try and send feedback. :-)|
|''Date:''|2014/04/30 released 3.0.0 <br>2014/01/18 collected from TWElement, TWtid and TWted|
|''License:''|Same as ~TiddlyWiki|
|''Core Version:''|2.7.0|

!!Features:
* Access to the defining wiki text corresponding to a DOM element.
** Locate the wiki text corresponding to a given DOM element.
** Get/Set the wiki text corresponding to a given DOM element.
* Synchronization between multiply transcluded copies in ~TiddlyWiki environment.
** Synchronize the output of multiply transcluded copies of a DOM element after changes.

!!Usage:

!!Options
Look for [[twveCoreOptions]] in the system Options panel.

!!Examples

!!Todo:

!!!Revision history
!!!! 2014/04/30 [3.0.0]
* Improved {{{partial refreshing}}} features.
** Partial refreshing is to refresh only the changed part, instead of the whole of a tiddler.
*** In the earliest versions the plugins did not do partial refreshing but only whole tiddler refreshing. This is usually fine when the tiddler is small, but can be slow when is large. In addition, whole tiddler refreshing destroys the original DOM elements and recreates new ones, causing the plugins to pay extra efforts to bookkeep the status of elements for later uses.
*** Later time partial refreshing was implemented for table cells.
*** Even later time this feature was extended to cover other elements, such as list items, headings, blockquotes, etc, for simple cases. For not-so-simple cases, such as changed level in headings or list items, or whole table refreshing, the plugins still did whole tiddler refreshing.
*** This version further extended the feature to cover whole tables and sections.
* Bug fixes
** for correct section title searching
*** Previously the section title was located with the criteria {{{.indexOf()>-1}}}, which could make mistakes when one section title is part of another preceding it. This version fixed this issue by making sure the section title, after removing the leading !'s and white spaces, does start with the searched pattern.
** for consistent alignment behavior in preview box
** for element level transclusion synchronization
*** Refreshing a table contained in a {{{FoldHeadingsPlugin}}} folded section can mess up the page. It is fixed in this version.
* Changed the return policy of internal functions {{{indexOf}}} and {{{lastIndexOf}}}.
** These two internal functions search in a string for 1) a certain pattern or 2) an array of equivalent patterns. Because of 2) their return value is an object consisting of {{{ndx}}} and {{{matched}}} properties. If a pattern is found, {{{ndx}}} is the index of the matched pattern, while the {{{matched}}} is the actually matched pattern. If, however, no pattern is found, the previous version set the {{{ndx}}} to {{{-1}}} but left the {{{matched}}} untouched as whatever it was, causing confusion some times. This version clears the {{{matched}}} property if no pattern is found.
!!!! 2014/01/18
* Collected from [[TWElement|http://twtable.tiddlyspace.com/#TWElement]], [[TWtid|http://twtable.tiddlyspace.com/#TWtid]] and [[TWted|http://twtable.tiddlyspace.com/#TWted]].

!!Code

!!!The very beginning
***/
//{{{
if ( typeof twve == 'undefined' ) {
	twve = {};
}
//}}}
/***
!!! Version information
***/
//{{{
version.extensions.twve = {
	major: 3, minor: 0,	revision: 0,
	date: new Date('2014/04/30')
};
//}}}
/***
!!! Macro for initialization and option settings.
***/
//{{{
config.macros.twveCoreOptions = {
	init : function () {
		// From TWtid
		if ( config.options.chktwveCoreEnabled===undefined )
			config.options.chktwveCoreEnabled =
				(config.options.chkTWtidEnabled===undefined ? true
				: config.options.chkTWtidEnabled);
		if ( config.options.chktwveCoreShowFocus===undefined )
			config.options.chktwveCoreShowFocus = 
				(config.options.chkTWtidShowFocus===undefined ? true
				: config.options.chkTWtidShowFocus);

		merge ( config.optionsDesc, {
			chktwveCoreEnabled:"Enable ''twve.core''.",
			chktwveCoreShowFocus:'Show focus borders.'
		} );

		twve.tiddler.prePopupShow = Popup.show;
		Popup.show = twve.tiddler.popupShow;

		twve.tiddler.preRefreshTiddler = story.refreshTiddler;
		story.refreshTiddler = twve.tiddler.refreshTiddler;
		// Macro {{{<<tabs ...>>}}} is not using story.refreshTiddler() to
		// render contents upon switching tabs, so tables inside don't
		// get a chance to reformat. Hijack the function here to take
		// care of tab switching.
		twve.tiddler.preTabsSwitchTab = config.macros.tabs.switchTab;
		config.macros.tabs.switchTab = twve.tiddler.tabsSwitchTab;

		// Macro {{{<<tiddler ...>>}}} is not storing tiddler.title
		// anywhere, leaving this plugin no way but hijacking its
		// transclude() function to find it.
		twve.tiddler.preTiddlerTransclude=config.macros.tiddler.transclude;
		config.macros.tiddler.transclude=twve.tiddler.tiddlerTransclude;

		// Macro {{{<<slider ...>>}}} directly calls wikify() in its
		// handler, which does not go through refreshTiddler() function
		// so that twve overrides the handler for its own needs.
		twve.tiddler.preSliderHandler = config.macros.slider.handler;
		config.macros.slider.handler = twve.tiddler.sliderHandler;
		twve.tiddler.preOnClickSlider = config.macros.slider.onClickSlider;
		config.macros.slider.onClickSlider = twve.tiddler.onClickSlider;

		config.browser.isIE11 =
			/\bnt\b(.*?)11/.test(config.userAgent);
		config.browser.isIE1076 =
			/msie 7(.*?)trident\/6/.test(config.userAgent);
		config.browser.isIE10 =
			/msie 10/.test(config.userAgent)
			|| config.browser.isIE1076;
		config.browser.isIE9 =
			/msie 9/.test(config.userAgent);
		config.browser.isIE975 =
			/msie 7(.*?)trident\/5/.test(config.userAgent);
		config.browser.isIE8 =
			/msie 8/.test(config.userAgent);
		config.browser.isIE874 =
			/msie 7(.*?)trident\/4/.test(config.userAgent);
		if ( config.browser.isIE
			&& ! ( config.browser.isIE11
					|| config.browser.isIE10
					|| config.browser.isIE1076
					|| config.browser.isIE9
					|| config.browser.isIE975
					|| config.browser.isIE8
					|| config.browser.isIE874 ) )
			displayMessage(
				"''twve'' message: Unsupported IE version.\n\n "
				+config.userAgent
				+'\n\nPlease inform the author at'
				+' qmo.wcy2@gmail.com. Thanks.'
			);
		config.browser.isWin7=/nt 6\.1/.test(config.userAgent);
		config.browser.isWinXP=/nt 5\.1/.test(config.userAgent);
		// Andtidwiki would be recognized as Safari on Linux and android.
		config.browser.isAndroid=/android/.test(config.userAgent);
		config.browser.isiOS =/ip(.*?)mac/.test(config.userAgent);

		if ( config.browser.isSafari && ! config.browser.isOpera ) {
			config.browser.isOpera=/opr/.test(config.userAgent);
		}

		jQuery(window).resize(function(ev){
			twve.tiddler.resize(ev || window.event);
		}).scroll(function(ev){
			twve.tiddler.scroll(ev || window.event);
		});

		// From TWted
		if ( config.options.chktwveCorePreview===undefined )
			config.options.chktwveCorePreview =
				(config.options.chkTWtedPreview===undefined ? true
				: config.options.chkTWtedPreview);
		if ( config.options.txttwveCorePreviewHeight===undefined )
			config.options.txttwveCorePreviewHeight =
				(config.options.txtTWtedPreviewMaxHeight===undefined ? '15'
				: config.options.txtTWtedPreviewMaxHeight);
		if ( config.options.txttwveCorePreviewCaret===undefined )
			config.options.txttwveCorePreviewCaret =
				(config.options.txtTWtedPreviewCaret===undefined ? '|'
				: config.options.txtTWtedPreviewCaret);
		if (/^[0-9]+$/.test(config.options.txttwveCorePreviewCaret))
			config.options.txttwveCorePreviewCaret=String.fromCharCode(
				config.options.txttwveCorePreviewCaret*1
			);
		if ( config.options.chktwveCoreConfirmToDelete===undefined )
			config.options.chktwveCoreConfirmToDelete =
				(config.options.chkTWtedConfirmToDelete===undefined?true:
				config.options.chkTWtedConfirmToDelete);
		if ( config.options.chktwveCoreClickAway===undefined )
			config.options.chktwveCoreClickAway =
				(config.options.chkTWtedClickAway===undefined?true:
				config.options.chkTWtedClickAway);
		if ( config.options.chktwveCoreManualSave===undefined )
			config.options.chktwveCoreManualSave =
				(config.options.chkTWtedManualSave===undefined?false:
				config.options.chkTWtedManualSave);
		if ( config.options.chktwveCoreManualUpload===undefined )
			config.options.chktwveCoreManualUpload =
				(config.options.chkTWtedManualUpload===undefined?false:
				config.options.chkTWtedManualUpload);

		merge ( config.optionsDesc, {
			chktwveCorePreview:'Enable previewer. Default to true.',
			txttwveCorePreviewHeight:'Previewer max height (lines of text). Default to 15.',
			txttwveCorePreviewCaret:'Caret in the previewer. Default to vertical line (|)',
			chktwveCoreConfirmToDelete:'Confirm before deleting elements.',
			chktwveCoreClickAway:'Click away to accept changes.',
			chktwveCoreManualSave:'Save changes to file manually. If true, a button labeled "S" will be provided for manual save. Otherwise the file will be saved each time a change is accepted.',
			chktwveCoreManualUpload:'Upload changes to server manually. If true, a button labeled "U" will be provided for manual upload. Otherwise all changes will be uploaded each time a change is accepted.'
		} );

		twve.tiddler.preCloseAllTiddlers = story.closeAllTiddlers;
		story.closeAllTiddlers = twve.tiddler.closeAllTiddlers;

		twve.tiddler.preEditHandler=config.commands.editTiddler.handler;
		config.commands.editTiddler.handler=twve.tiddler.editHandler;
		twve.tiddler.preCloseHandler=
			config.commands.closeTiddler.handler;
		config.commands.closeTiddler.handler=twve.tiddler.closeHandler;
		twve.tiddler.preSaveHandler=config.commands.saveTiddler.handler;
		config.commands.saveTiddler.handler=twve.tiddler.saveHandler;
		twve.tiddler.preCancelHandler=
			config.commands.cancelTiddler.handler;
		config.commands.cancelTiddler.handler=twve.tiddler.cancelHandler;

		twve.tiddler.preSaveChanges = saveChanges;
		saveChanges = twve.tiddler.saveChanges;

		twve.wrapper.prepareElements = twve.heading.prepareElements;

		// Prepare the Options panel
		var txt = config.shadowTiddlers['OptionsPanel'];
		var p = txt.indexOf('----');
		config.shadowTiddlers['OptionsPanel']=
			txt.substring(0,p)
			+'----\n'
			+'[[twve.core Options|twve.core Options]]\n'
			+txt.substring(p);

		merge(config.shadowTiddlers,{
			'twve.core Options':'<<twveCoreOptions>>'
		});

		// Register elements
		twve.tiddler.registerElement(twve.heading);
		twve.tiddler.registerElement(twve.pre);
		twve.tiddler.registerElement(twve.code);
		// Register wrappers
		twve.tiddler.registerWrapper(twve.viewer);
		twve.tiddler.registerWrapper(twve.tabContent);
		twve.tiddler.registerWrapper(twve.tiddlerSpan);
		twve.tiddler.registerWrapper(twve.sliderPanel);
	},

	order : {
		// From TWtid
		chktwveCoreEnabled:0,
		chktwveCoreShowFocus:1,
		// From TWted
		txttwveCorePreviewHeight:2,
		chktwveCorePreview:3,
		txttwveCorePreviewCaret:4,
		chktwveCoreConfirmToDelete:5,
		chktwveCoreClickAway:6,
		chktwveCoreManualSave:7,
		chktwveCoreManualUpload:8
	},

	collectOptions : function (key, order) {
		// Collect twve options.
		var ttopts = [];
		for ( var n in config.options ) {
			if ( n.indexOf(key) >= 0 ) {
				var msg = config.optionsDesc[n];
				if ( ! msg ) continue;
				var pdot = msg.indexOf('twve.');
				pdot > -1 ? (pdot+=5) : (pdot=0);
				pdot = msg.indexOf('.',pdot);
				pdot == -1 ? (pdot=msg.length) : (pdot++);
				ttopts.push('\n|<<option '+n+'>>|'+
					msg.substring(0,pdot)+' |');
			}
		}
		// Sort them according to that defined in option_order[].
		if ( order )
			ttopts.sort(function(a,b){
				var ka=a.substring(a.indexOf(' ')+1,a.indexOf('>>')),
					kb=b.substring(b.indexOf(' ')+1,b.indexOf('>>'));
				return order[ka] > order[kb] ? 1 : -1;
			});
		return ttopts;
	},
	prepareOptionsTable : function (cap,key,order) {
		var opts = '|'+cap+'|c'+'\n| Value | Description |h';
		var ttopts = this.collectOptions(key, order);
		jQuery.each(ttopts, function(n,item){
			opts += item;
		});
		return opts;
	},
	showOptionsTable : function (place, cap, key, order) {
		var $div_opt = jQuery(
			document.createElement('div')
		).appendTo(place);
		var opts = this.prepareOptionsTable(cap,key,order);
		// Render the table.
		wikify ( opts, $div_opt[0] );
		// Adjust width
		$div_opt.find('table input').css('width','5em');
	},
	handler : function(place) {
		// Collect all the twve options for users to play with.
		config.macros.twveCoreOptions.showOptionsTable(
			place,
			"''twve.core'' Options",
			'twveCore',
			config.macros.twveCoreOptions.order
		);
	}
};
//}}}
/***
!!! twve definitions
The ''twve'' is divided into several components:
# General purpose components:
## ''twve.object'': base for all twve objects;
# Tiddler and wiki text related:
## ''twve.tiddler'': representing the tiddlers;
## ''twve.text'': wiki text handling;
## ''twve.tags'': opening and closing tags of elements;
## ''twve.position'':
# DOM related components:
## ''twve.selector'':
## ''twve.node'': base for all DOM related objects
## ''twve.button'':
## ''twve.menu'': floating menu
## ''twve.editable'': base for twve.element and twve.wrapper;
## ''twve.element'': base for editable elements;
### ''twve.heading'':
### ''twve.pre'': preformatted block
### ''twve.code'': code block
## ''twve.wrapper'': base for editable wrappers;
### ''twve.viewer'': for normally loaded tiddlers;
### ''twve.tabContent'': for {{{<<tabs>>}}} transcluded tiddlers;
### ''twve.tiddlerSpan'': for {{{<<tiddler>>}}} transcluded tiddlers;
### ''twve.sliderPanel'': for {{{<<slider>>}}} transcluded tiddlers;
### ''twve.foldedSection'': for {{{<<foldHeadings>>}}} folded sections (defined in twve.extra);
### ''twve.tiddlerTitle'': for tiddler title;
The following lines of codes show the definition of each part.

!!! twve.object
***/
//{{{
twve.object = {
//}}}
/***
!!!! twve.object.toString
***/
//{{{
	level : 0,
	toString : function (obj) {
		switch ( typeof obj ) {
			case 'function' :
				return 'function';
			case 'object' :
				if ( ! obj ) return obj;
				if ( obj.jquery || obj.nodeType ) {
					return twve.node.info(obj);
				} else if ( obj.title && obj.modifier ) {
					// tiddler object
					return '{title: '+obj.title+' ...}';
				}
				var val = '{';
				jQuery.each(twve.object.keys(obj),function(n,k){
					val += (n==0?'':', ')+'\n\t'+k+':';
					var v = obj[k];
					if ( v ) {
						if ( ++twve.object.level < 5 ) {
							val += twve.object.toString(v);
							--twve.object.level;
						}
					} else
						val += v;
				});
				val += '\n}';
				return val;
			default :
				return obj;
		}
	},
//}}}
/***
!!!! twve.object.keys
***/
//{{{
	keys : function(obj) {
		var keys = new Array();
		for ( var key in obj ) {
			if ( typeof obj[key] != 'function' ) {
				keys.push(key);
			}
		}
		return keys;
	},
//}}}
/***
!!!! twve.object.copyKey
***/
//{{{
	copyKey : function(dest,src,key){
		switch ( typeof src[key] ) {
			case 'string' :
			case 'number' :
			case 'boolean' :
				dest[key] = src[key];
				break;
			case null :
				dest[key] = null;
				break;
			case 'undefined' :
			case 'function' :
				break;
			default :
				dest[key] = {};
				jQuery.each(
					twve.object.keys(src[key]),
					function(n,k){
						twve.object.copyKey(
							dest[key],src[key],src[key][k]
						);
						//dest[key][k] = src[key][k];
					}
				);
		}
		return dest;
	},
//}}}
/***
!!!! twve.object.copyKeys
***/
//{{{
	copyKeys : function(dest,src,keys){
		jQuery.each(keys,function(n,k){
			twve.object.copyKey(dest,src,k);
		});
		return dest;
	},
//}}}
/***
!!!! twve.object.create
***/
//{{{
	create : function(src) {
		var obj = {};
		// copyKey
		obj.copyKey = function(src,key){
			return twve.object.copyKey(obj,src,key);
		};
		// keys
		obj.keys = function(){
			return twve.object.keys(obj);
		};
		// copyFrom
		obj.copyFrom = function(src,keys){
			return twve.object.copyKeys(
				obj, src,
				keys || obj.keys() || src.keys()
			);
		};
		// toString
		obj.toString = function (){
			return twve.object.toString(obj);
		}
		// created
		obj.created = function(src){
			return src
				? obj.copyFrom(src)
				: obj;
		}
		// End of definitions.
		return obj.created(src);
	}
};
//}}}
/***
!!! twve.tiddler
***/
//{{{
twve.tiddler = {
//}}}
/***
!!!! twve.tiddler.registered_element
***/
//{{{
	registered_element : null,
//}}}
/***
!!!! twve.tiddler.registered_wrapper
***/
//{{{
	registered_wrapper : null,
//}}}
/***
!!!! twve.tiddler.registerElement
***/
//{{{
	registerElement : function(obj){
		// Register one type of editable element to twve.tiddler.
		// Elements that are editable should/could do the followings:
		//		1.	have an "enableEdit" property which enables/disables
		//			the editable status of its kind;
		//		2.	have the following methods :
		//			# "twveSelector" method which
		//				a. accepts a twve.selector object (sel),
		//				b. calls
		//					sel.includeSelector('inc_selector')
		//						to add the include selector, and
		//					sel.excludeSelector('exc_selector')
		//						to add the exclude selector, if
		//						desired,
		//				c. returns the twve.selector object (sel).
		//			# "wikiTags" method to return the wiki
		//				tags of its kind. For example
		//					return twve.tags.create(
		//						"opening tag",
		//						"closing tag"
		//					);
		//				(If your editable element do have a pair of
		//				specific signatures, implement this method to
		//				return them. Otherwise just skip it.)
		//			# "create" method to create elements of its kind,
		//			# (optional) "htmlTags" method to return the
		//				html tags of its kind. For example
		//					return twve.tags.create(
		//						"opening tag",
		//						"closing tag"
		//					);
		//				(You need to create this method only when
		//				your plugin supports HTML syntax.)
		//			# (optional) "getText" method to get the text
		//				of the element in a way different from the
		//				default (see "getText" in twve.editable.create);
		//			# (optional) "setText" method to set the text
		//				of the element in a way different from the
		//				default (see "setText" in twve.editable.create);
		//			# (optional) "clone" method to generate an identical
		//				copy of the element in a way different from the
		//				default (see twve.tiddler.cloneEditable).
		//			# (optional) "mouseenter" method to prepare your
		//				element upon mouseenter event. Return true/false
		//				to accept/reject the entrance of mouse pointer.
		//				See the mouseenter method in twve.table for an
		//				example.
		//			# (optional) "mousemove" method to have your
		//				element respond to the mousemove event. See the
		//				mousemove method in twve.table for an example.
		//			# (optional) "mouseleave" method to prepare your
		//				element upon mouseleave event. Return true/false
		//				to accept/reject the leaving of mouse pointer.
		//				See the mouseleave method in twve.tiddlerTitle or
		//				twve.table for examples.
		//			# (optional) "focus" method to prepare your
		//				element for getting the focus.
		//			# (optional) "blur" method to prepare your element for
		//				losing focus. See the blur method in twve.table
		//				for an example.
		//		3.	call twve.tiddler.registerElement(obj) during plugin
		//			initialization to register the editable element.
		if ( ! twve.tiddler.registered_element ) {
			twve.tiddler.registered_element = new Array();
			twve.tiddler.registered_element.push(obj);
		} else if(twve.tiddler.registered_element.indexOf(obj)==-1)
			twve.tiddler.registered_element.push(obj);
	},
//}}}
/***
!!!! twve.tiddler.registerWrapper
***/
//{{{
	registerWrapper : function(obj){
		// Register one type of editable wrapper to twve.
		// An editable wrapper should/could, like an editable element,
		// do the followings:
		//		1.	have an "enableEdit" property which enables/disables
		//			the editable status of its kind;
		//		2.	have the following methods :
		//			# "twveSelector" method, see "registerElement"
		//			  above for details;
		//			# "titleOfWrapper" method to return the tiddler
		//			  title associated with that wrapper, see the
		//			  definition of any one of the system wrappers
		//			  near the end of this file for an example;
		//			# "wrapperFromTitle" method to return the wrappers
		//			  containing the tiddler with a given title, see the
		//			  definition of any one of the system wrappers near
		//			  the end of this file for an example;
		//			# "create" method to create wrappers of its kind,
		//			# (Optional) "wikiTags" method to return the wiki
		//				tags of its kind. For example
		//					return twve.tags.create(
		//						"opening tag",
		//						"closing tag"
		//					);
		//				(This is necessary when the wrappers of this
		//				kind contain transcluded content. See the
		//				definition of any of the system wrappers near
		//				the end of this file for an example.)
		//			# (optional) "clone" method to generate an identical
		//				copy of the element in a way different from the
		//				default (see twve.tiddler.cloneEditable).
		//		3.	call twve.tiddler.registerWrapper(obj) during plugin
		//			initialization to register the editable wrapper.
		if ( ! twve.tiddler.registered_wrapper ) {
			twve.tiddler.registered_wrapper = new Array();
			twve.tiddler.registered_wrapper.push(obj);
		} else if(twve.tiddler.registered_wrapper.indexOf(obj)==-1)
			twve.tiddler.registered_wrapper.push(obj);
	},
//}}}
/***
!!!! twve.tiddler.enableAllEditable
***/
//{{{
	enableAllEditable : function(enabled){
		// Enable/Disable all registered editable objects at the
		// same time.
		jQuery.each(twve.tiddler.registered_element,function(n,obj){
			if ( obj.enableEdit )
				obj.enableEdit = (enabled !== false);
		});
	},
//}}}
/***
!!!! twve.tiddler.registeredEditableObject
***/
//{{{
	registeredEditableObject : function(
		$elem,registered,include_selector
	){
		if ( readOnly || ! $elem || ! registered
			|| !config.options.chktwveCoreEnabled
		)
			return null;
		// Finds the registered editable object that corresponds
		// to the type of $elem (jQuery object).
		var selector = twve.selector.create();
		for(var n = registered.length-1; n>=0; n--){
			var obj = registered[n];
			if ( obj.enableEdit ){
				selector.clear();
				obj.twveSelector(selector);
				if ( $elem.is(selector.include) &&
						! $elem.is(selector.exclude) )
					return include_selector
						?	{
								obj: obj,
								selector: selector
							}
						: obj;
			}
		}
		return null;
	},
//}}}
/***
!!!! twve.tiddler.createEditableElement
***/
//{{{
	createEditableElement : function($elem){
		// Creates an instance of the registered editable object
		// that corresponds to the type of $elem (jQuery object).
		var obj_sel = twve.tiddler.registeredEditableObject(
			$elem,
			twve.tiddler.registered_element,
			true
		);
		if ( ! obj_sel ) return null;
		return obj_sel.obj.create
			? obj_sel.obj.create($elem)
			: twve.element.create($elem);
	},
//}}}
/***
!!!! twve.tiddler.twveSelector
***/
//{{{
	twveSelector : function($elem){
		// Finds the selector corresponding to element $elem (jQuery
		// object).
		var obj_sel = twve.tiddler.registeredEditableObject(
			$elem,
			twve.tiddler.registered_element,
			true
		);
		if ( ! obj_sel )
			obj_sel = twve.tiddler.registeredEditableObject(
				$elem,
				twve.tiddler.registered_wrapper,
				true
			);
		return obj_sel ? obj_sel.selector : null;
	},
//}}}
/***
!!!! twve.tiddler.twveFoldableSelector
***/
//{{{
	twveFoldableSelector : function(){
		return twve.sliderPanel.twveSelector();
	},
//}}}
/***
!!!! twve.tiddler.twveWrapperSelector
***/
//{{{
	twveWrapperSelector : function(selector){
		if (!selector) selector = twve.selector.create();
		var registered = twve.tiddler.registered_wrapper;
		for(var n = registered.length-1; n>=0; n--){
			registered[n].twveSelector(selector);
		}
		return selector;
	},
//}}}
/***
!!!! twve.tiddler.wikiTags
***/
//{{{
	wikiTags : function($elem){
		// Finds the wiki tags corresponding to element $elem (jQuery
		// object).
		var twobj = twve.tiddler.registeredEditableObject(
			$elem,
			twve.tiddler.registered_element
		);
		return twobj && twobj.wikiTags
			? twobj.wikiTags()
			: null;
	},
//}}}
/***
!!!! twve.tiddler.registeredSelectors
***/
//{{{
	registeredSelectors : function(registered){
		var selector = twve.selector.create();
		for(var n = registered.length-1; n>=0; n--)
			registered[n].twveSelector(selector);
		return selector;
	},
//}}}
/***
!!!! twve.tiddler.elementSelectors
***/
//{{{
	elementSelectors : function(){
		return twve.tiddler.registeredSelectors(
			twve.tiddler.registered_element
		);
	},
//}}}
/***
!!!! twve.tiddler.wrapperSelectors
***/
//{{{
	wrapperSelectors : function(){
		return twve.tiddler.registeredSelectors(
			twve.tiddler.registered_wrapper
		);
	},
//}}}
/***
!!!! twve.tiddler.directWrapper
***/
//{{{
	directWrapper : function($elem){
		var $w = $elem.parent().closest(
			twve.tiddler.wrapperSelectors().include
		);
		return $w.size() > 0
			? twve.tiddler.createEditableWrapper($w)
			: null;
	},
//}}}
/***
!!!! twve.tiddler.createEditableWrapper
***/
//{{{
	createEditableWrapper : function($w){
		// Creates an instance of the registered editable wrapper
		// that corresponds to the type of $w (jQuery object), and finds
		// its wrapper title.
		var wrap = twve.tiddler.registeredEditableObject(
			$w,
			twve.tiddler.registered_wrapper
		);
		if ( wrap ) {
			var twwrap = wrap.create
				? wrap.create($w)
				: twve.wrapper.create($w);
			if ( twwrap )
				twwrap.wrapper_title = wrap.titleOfWrapper($w);
			return twwrap;
		}
		return null;
	},
//}}}
/***
!!!! twve.tiddler.createEditable
***/
//{{{
	createEditable : function($elem){
		// Creates an instance of the registered editable element
		// or wrapper that corresponds to the type of $elem
		// (jQuery object).
		var twelem = twve.tiddler.createEditableElement($elem);
		return twelem
			? twelem
			: twve.tiddler.createEditableWrapper($elem);
	},
//}}}
/***
!!!! twve.tiddler.cloneEditable
***/
//{{{
	cloneEditable : function(tweditable){
		// Clones an instance of the registered editable element
		// or wrapper tweditable (twve.editable object).
		var twobj = twve.tiddler.registeredEditableObject(
			tweditable.$dom,
			twve.tiddler.registered_element
		);
		if ( twobj )
			return twobj.create
				? twobj.create(tweditable)
				: twve.element.create(tweditable);

		twobj = twve.tiddler.registeredEditableObject(
			tweditable.$dom,
			twve.tiddler.registered_wrapper
		);
		return twobj
			? (twobj.create
				? twobj.create(tweditable)
				: twve.wrapper.create(tweditable))
			: null;
	},
//}}}
/***
!!!! twve.tiddler.titleOfWrapper
***/
//{{{
	titleOfWrapper : function ($w) {
		// Find the title of a given wrapper $w (jQuery object).
		if ( ! $w || $w.size() == 0 ) return '';
		var twobj = twve.tiddler.registeredEditableObject(
			$w, twve.tiddler.registered_wrapper
		);
		return (twobj && twobj.titleOfWrapper)
			? twobj.titleOfWrapper($w)
			: '';
	},
//}}}
/***
!!!! twve.tiddler.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function (title) {
		// Find all the registered wrappers with the given tiddler
		// title.

		// A tiddler may be loaded multiple times and displayed in
		// different wrappers with transclusion macros.
		// This function finds all the wrappers corresponding to the
		// same tiddler title.

		// First we go to the top level, the 'div.tiddlerDisplay',
		// then call the "wrapperFromTitle" method of each registered
		// wrapper to collect all wrappers with that given title.
		//
		// This function returns a jQuery object representing all
		// the rendered copies of the corresponding tiddler title.

		if ( ! title ) return null;

		title = twve.text.removeHeaderTail(title);
		var tid_title = twve.text.tiddlerTitle(title);
		var $w0 = jQuery(document).find('div[id=tiddlerDisplay]');
		var $w = null;

		var registered_wrapper = twve.tiddler.registered_wrapper;
		for(var n = registered_wrapper.length-1; n>=0; n--){
			var wrap = registered_wrapper[n];
			if ( wrap.wrapperFromTitle ) {
				var $w1 = wrap.wrapperFromTitle(
					tid_title, $w0
				);
				$w = $w ? $w.add($w1) : $w1;
			}
		}
		return $w;
	},
//}}}
/***
!!!! twve.tiddler.get
***/
//{{{
	get : function ( title, where ) {
		// Get the tiddler with the given title from
		// store or story.
		if ( ! where || where != story ) where = store;
		return where.getTiddler(twve.text.tiddlerTitle(title));
	},
//}}}
/***
!!!! twve.tiddler.displaySelector
***/
//{{{
	displaySelector : function(){
		return 'div[id=displayArea]';
	},
//}}}
/***
!!!! twve.tiddler.getDisplay
***/
//{{{
	getDisplay : function(){
		return jQuery(document).find('div[id=displayArea]');
	},
//}}}
/***
!!!! twve.tiddler.getOptionsMenu
***/
//{{{
	optionsMenu : null,
	getOptionsMenu : function(){
		if ( ! twve.tiddler.optionsMenu ) {
			twve.tiddler.optionsMenu = twve.menu.create(
				twve.button.create(
					null,
					String.fromCharCode(8801),
					"''twve'' menu"
				)
			);
			var item = twve.tiddler.optionsMenu.addItem(
				"''twve.core'' Options"
			);
			item.submenu = twve.menu.create(item,true);
			config.macros.twveCoreOptions.handler(
				item.submenu.$dom[0]
			);
		}
		return twve.tiddler.optionsMenu;
	},
//}}}
/***
!!!! twve.tiddler.cur_focus
***/
//{{{
	cur_focus : null,
//}}}
/***
!!!! twve.tiddler.focusElem
***/
//{{{
	focusElem : function ( twelem ) {
		if ( typeof twelem != 'undefined' ) {
			// twelem is given
			if ( twelem ) {
				// setting focus element
				if ( twve.tiddler.cur_focus ) {
					// There is currently focused element which is
					// different from the one to get focused (this is
					// made sure before calling this method).
					if ( twve.tiddler.cur_focus.blur )
						// call its blur() method if it has it
						twve.tiddler.cur_focus.blur();
					// call the focus() method of the newly focused
					// element if it has it
					if ( twelem.focus ) twelem.focus();
				} else if ( twelem.focus )
					twelem.focus();
			} else {
				// removing focus element
				if ( twve.tiddler.cur_focus
					&& twve.tiddler.cur_focus.blur )
					twve.tiddler.cur_focus.blur();
			}
			twve.tiddler.cur_focus = twelem;
		}
		return twve.tiddler.cur_focus;
	},
//}}}
/***
!!!! twve.tiddler.focusing_borders
***/
//{{{
	$border_top : null,
	$border_bottom : null,
	$border_left : null,
	$border_right : null,
//}}}
/***
!!!! twve.tiddler.drawFocusBorders
***/
//{{{
	drawFocusBorders : function(eb){
		twve.tiddler.$border_top.css({
			'left':eb.left
			,'top':eb.top
			,'width':eb.width
		});
		twve.tiddler.$border_bottom.css({
			'left':eb.left
			,'top':eb.bottom
			,'width':eb.width
		});
		twve.tiddler.$border_left.css({
			'left':eb.left
			,'top':eb.top
			,'height':eb.height
		});
		twve.tiddler.$border_right.css({
			'left':eb.right
			,'top':eb.top
			,'height':eb.height
		});
		if ( config.options.chktwveCoreShowFocus ) {
			twve.tiddler.$border_top.show();
			twve.tiddler.$border_bottom.show();
			twve.tiddler.$border_left.show();
			twve.tiddler.$border_right.show();
		}
	},
//}}}
/***
!!!! twve.tiddler.focus
***/
//{{{
	focus : function(twelem,action,ev) {
		var $elem = null;
		if ( ! twelem || ! config.options.chktwveCoreEnabled ) {
			action = 'off';
		} else {
			$elem = twelem.$dom;
			if ( $elem.closest('.preview').size()>0 )
				return;
			if ( config.options.chktwveCoreNoClick ) {
				if(! twve.tiddler.cur_twelem
					|| ! twve.tiddler.cur_twelem.is($elem))
						twve.tiddler.editInPlace(twelem,ev);
			}
		}

		if ( ! twve.tiddler.$border_top ) {
			// Focusing borders not existing. Create them.
			var bw='1px', bs='dashed';
			var $display=jQuery(document).find(
				'div[id=tiddlerDisplay]'
			);
			twve.tiddler.$border_top = jQuery(
				document.createElement('div')
			).appendTo($display).css({
				'position':'absolute'
				,'border-top-width':bw
				,'border-top-style':bs
				,'height':0
			});
			twve.tiddler.$border_bottom = jQuery(
				document.createElement('div')
			).appendTo($display).css({
				'position':'absolute'
				,'border-top-width':bw
				,'border-top-style':bs
				,'height':0
			});
			twve.tiddler.$border_left = jQuery(
				document.createElement('div')
			).appendTo($display).css({
				'position':'absolute'
				,'border-left-width':bw
				,'border-left-style':bs
				,'width':0
			});
			twve.tiddler.$border_right = jQuery(
				document.createElement('div')
			).appendTo($display).css({
				'position':'absolute'
				,'border-left-width':bw
				,'border-left-style':bs
				,'width':0
			});
		}

		twve.tiddler.$border_top.hide();
		twve.tiddler.$border_bottom.hide();
		twve.tiddler.$border_left.hide();
		twve.tiddler.$border_right.hide();
		if ( readOnly || ! $elem ) {
			twve.tiddler.focusElem(null);
			return;
		}

		if ( twelem && action != 'off' ) {
			twve.tiddler.focusElem(twelem);
			var eb = twelem.box('focus',ev);
			if(eb.height>=twve.node.cssSize('font-size',$elem)){
				twve.tiddler.drawFocusBorders(eb);
				return true;
			}
		} else {
			twve.tiddler.focusElem(null);
		}
		return;
	},
//}}}
/***
!!!! twve.tiddler.mousePosition
***/
//{{{
	mousePosition : function(ev){
		var pos = twve.object.create();
		var $display = twve.tiddler.getDisplay();
		if ( $display.css('position')!='static' ) {
			var $win = jQuery(window);
			pos.x = ev.clientX + $win.scrollLeft();
			pos.y = ev.clientY + $win.scrollTop();
			var dpos = $display.offset();
			if ( dpos ) {
				pos.x -= dpos.left;
				pos.y -= dpos.top;
			}
		} else {
			pos.x = ev.pageX;
			pos.y = ev.pageY;
		}
		return pos;
	},
//}}}
/***
!!!! twve.tiddler.mouseMove
***/
//{{{
	mouseMove : function(ev) {
		ev = ev || window.event;
		var focus = twve.tiddler.focusElem();
		var $elem = jQuery(ev.target);
		var tweditable = null;
		if ( focus ) {
			if ( focus.is($elem) ) {
				// Mouse is still over the same element.
				if ( focus.mousemove ) focus.mousemove(ev);
			} else {
				// Mouse has come to another element.
				if(jQuery.contains(focus.$dom[0],$elem[0])){
					// If this other element is within the focused one,
					// yield focus if it is a registered editable.
					tweditable = twve.tiddler.createEditable($elem);
					if ( tweditable ) twve.tiddler.focus();
				} else {
					// If this other element is outside of the focused
					// one, ask the focused one to leave and yield focus
					// if it agrees or says nothing.
					var leaving = focus.mouseleave
						? focus.mouseleave(ev)
						: true;
					if ( leaving ) {
						twve.tiddler.focus();
						tweditable = twve.tiddler.createEditable($elem);
					}
				}
			}
		} else
			// There is currently no focused element.
			tweditable = twve.tiddler.createEditable($elem);

		if ( tweditable ) {
			if ( ! tweditable.mouseenter || tweditable.mouseenter(ev) )
				twve.tiddler.focus(tweditable,'on',ev);
		}
	},
//}}}
/***
!!!! twve.tiddler.eventTarget
***/
//{{{
	eventTarget : function(ev){
		return (ev.button == 0
			|| (config.browser.isIE && ev.button == 1)) // left button
			//? document.elementFromPoint(ev.clientX,ev.clientY)
			? jQuery(ev.target)
			: null;
	},
//}}}
/***
!!!! twve.tiddler.mouseDown
***/
//{{{
	$down_elem : null,
	mouseDown : function (ev) {
		return (twve.tiddler.$down_elem =
			twve.tiddler.eventTarget(ev || window.event)
		);
	},
//}}}
/***
!!!! twve.tiddler.mouseUp
***/
//{{{
	mouseUp : function (ev) {
		ev = ev || window.event;
		var pos = twve.tiddler.mousePosition(ev);
		var menu = twve.tiddler.getOptionsMenu();
		if ( menu.isVisible() && menu.contains(pos) ) {
			return;
		}
		menu.hide(true);
		if ( ! twve.tiddler.$down_elem ) return;
		var $up_elem = twve.tiddler.eventTarget(ev);
		if ( ! $up_elem ) return;
		if ( $up_elem[0]==twve.tiddler.$down_elem[0]
				&& ! twve.button.isSystemButton($up_elem) ) {
			var $edbox = twve.tiddler.getEditBox();
			if ( $up_elem.is($edbox) ) {
				setTimeout(function(){
					twve.tiddler.previewEditBox($up_elem);
				}, 0);
				return;
			}
			if ( $up_elem.closest('.preview').size() > 0
				|| $up_elem.is('textarea,input') ) {
				return;
			}

			if ( $up_elem.is(
					'html,#displayArea,#contentWrapper,.txtMainTab' +
					',.header,.headerShadow,.headerForeground' +
					',.siteTitle,.siteSubtitle,#menuBar'
				) ) {
				twve.tiddler.updateText();
				twve.tiddler.focus();
				return;
			}

			var twelem = twve.tiddler.focusElem();
			if ( twelem ) {
				if ( $edbox )
					twve.tiddler.updateText();
				if ( twelem.isEditable($up_elem,ev) )
					return ! twve.tiddler.editInPlace(twelem,ev);
			}
		}
	},
//}}}
/***
!!!! twve.tiddler.resize
***/
//{{{
	resize : function (ev) {
		if ( twve.tiddler.cur_twelem ) return;
		if (! (config.browser.isAndroid
				|| config.browser.isiOS
				|| (config.browser.isIE
					&& !config.browser.isIE9))) {
			var $doc = jQuery(document);
			var twview = twve.viewer.create();
			var selector = twve.viewer.twveSelector();
			$doc.find(selector.include).each(function(n,v){
				twview.setElement(jQuery(v));
				twview.refreshSelf();
				twview.clear();
			});
			twve.tiddler.focusElem(null);
			var $sb = $doc.find('#sidebar,#mainMenu');
			if ( jQuery(window).width() < screen.width/2 ) {
				$sb.hide();
			} else $sb.show();
		}
	},
//}}}
/***
!!!! twve.tiddler.scroll
***/
//{{{
	scroll : function (ev) {
		if ( twve.tiddler.cur_twelem ) {
			var eb = twve.tiddler.cur_twelem.box('edit');
			var $ed = twve.tiddler.getEditBox();
			if ( $ed )
				$ed.css({
					left:eb.left,
					top:eb.top
				});
			var $preview = twve.tiddler.getPreviewer();
			if ( $preview )
				$preview.css({
					left:eb.left,
					top:eb.top-$preview.outerHeight()
				});
		}
	},
//}}}
/***
!!!! twve.tiddler.saveText
***/
//{{{
	saveText : function(twelem,text,newtitle){
		var tiddler = twelem.tiddler;
		var newtext = text ? text : tiddler.text;

		if ( newtitle ) {
			if(store.tiddlerExists(newtitle)) {
				if(!confirm(config.messages.overwriteWarning
					.format([newtitle])))
					return null;
				story.closeTiddler(newtitle,false);
			}
			var tiddlerElem = story.getTiddler(tiddler.title);
			tiddlerElem.id = story.tiddlerId(newtitle);
			tiddlerElem.setAttribute("tiddler",newtitle);
			store.saveTiddler(tiddler.title,newtitle,newtext);
			return newtext;
		}

		var undo_saveTiddler = null;
		if ( config.macros.undo ) {
			// If UndoPlugin is installed, let it do its job but
			// not to save the tiddler.
			undo_saveTiddler = store.undo_saveTiddler;
			store.undo_saveTiddler = function() {};
			store.saveTiddler(tiddler.title,tiddler.title,newtext);
		}

		// The following lines of code saves the changes just made to a
		// table cell. According to TiddlyWiki web page it is a common
		// practice to use store.saveTiddler () to save the content
		// of a tiddler. This is usually fine except when
		// <<foldHeadings>> macro is used: the headings get folded
		// again.
		//store.saveTiddler (
		//	tiddler.title,tiddler.title,
		//	newtext,tiddler.modifier,new Date()
		//);
		tiddler.set(
			tiddler.title,newtext,tiddler.modifier,new Date()
		);
		store.setDirty(true);

		if ( config.macros.undo ) {
			// If UndoPlugin is installed, the saveTiddler() function
			// was temporarily disabled. Put it back now.
			store.undo_saveTiddler = undo_saveTiddler;
		}

		// Save changes to local file or server
		if ( window.location.protocol == "file:" ) {
			if ( !config.options.chktwveCoreManualSave )
				autoSaveChanges (null,[twelem.tiddler]);
		} else if ( !config.options.chktwveCoreManualUpload &&
				config.macros.upload ) {
			config.macros.upload.action();
		}

		return newtext;
	},
//}}}
/***
!!!! twve.tiddler.refreshTiddler
***/
//{{{
	preRefreshTiddler : null,
	refreshTiddler : function () {
		var elem=twve.tiddler.preRefreshTiddler.apply(this,arguments);
		if ( config.options.chktwveCoreEnabled ) {
			var $elem = jQuery(elem);
			var $viewer = $elem.find('.viewer');
			var vs = $viewer.size();
			if ( vs == 0 ) $viewer = $elem;

			twve.viewer.create($viewer).waitAndPrepare();

			// Bind the mousemove event handler to the tiddlerDisplay
			// area. The unbind calls are necessary to prevent multiple
			// invocation upon single event due to multiply bound
			// handler.
			$elem.closest('div[id=tiddlerDisplay]')
				.unbind('mousemove', twve.tiddler.mouseMove)
				.bind('mousemove', twve.tiddler.mouseMove);

			// Because FireFox jumps out of the element if text
			// selection is finished with mouse released over another,
			// the click event is not a good place to determine
			// which element to edit. Instead, this plugin compares the
			// element in mousedown and mouseup, and goes to edit
			// function only if they are the same one.

			// The unbind calls are necessary to prevent multiple
			// invocation upon single event due to multiply bound
			// handler.
			jQuery(document)
				.unbind('mousedown', twve.tiddler.mouseDown)
				.bind('mousedown', twve.tiddler.mouseDown)
				.unbind('mouseup', twve.tiddler.mouseUp)
				.bind('mouseup', twve.tiddler.mouseUp);
		}
		return elem;
	},
//}}}
/***
!!!! twve.tiddler.popupShow
***/
//{{{
	prePopupShow : null,
	popupShow : function () {
		twve.tiddler.prePopupShow.apply(this,arguments);
		var curr = Popup.stack[Popup.stack.length-1];
		twve.wrapper.create(jQuery(curr.popup)).waitAndPrepare();
		return curr;
	},
//}}}
/***
!!!! twve.tiddler.tabSwitchTab
***/
//{{{
	preTabsSwitchTab : null,
	tabsSwitchTab : function (tabset,tab) {
		// Hijacking the switchTab function of <<tabs>> macro.
		twve.tiddler.preTabsSwitchTab.apply(this,arguments);
		var $tabset = jQuery(tabset);
		if($tabset.closest(twve.tiddler.displaySelector()).size()>0) {
			twve.tabContent.create($tabset.next()).waitAndPrepare();
		}
	},
//}}}
/***
!!!! twve.tiddler.tiddlerTransclude
***/
//{{{
	preTiddlerTransclude : null,
	tiddlerTransclude : function (wrapper) {
		// Hijacking the handler of <<tiddler>> macro.
		twve.tiddler.preTiddlerTransclude.apply(this,arguments);
		var $w = jQuery(wrapper);
		if($w.closest(twve.tiddler.displaySelector()).size()>0) {
			var ts = twve.tiddlerSpan.create($w);
			if ( ts.waitAndPrepare ) ts.waitAndPrepare();
		}
	},
//}}}
/***
!!!! twve.tiddler.sliderHandler
***/
//{{{
	preSliderHandler : null,
	sliderHandler : function (place) {
		// Hijacking the handler of <<slider>> macro.
		twve.tiddler.preSliderHandler.apply(this,arguments);
		var $p = jQuery(place);
		if($p.closest(twve.tiddler.displaySelector()).size()>0) {
			var sp = twve.sliderPanel.create($p.find('div[tiddler]'));
			if ( sp.waitAndPrepare ) sp.waitAndPrepare();
		}
	},
//}}}
/***
!!!! twve.tiddler.onClickSlider
***/
//{{{
	preOnClickSlider : null,
	onClickSlider : function () {
		// Hijacking the onClick handler of <<slider>> macro.
		twve.tiddler.preOnClickSlider.apply(this,arguments);
		//twve.sliderPanel.create(jQuery(this).next())
		//	.waitAndPrepare();
	},
//}}}
/***
!!!! twve.tiddler.cur_twelem
<<<
The element being edited. Note that this may be different from the element being focused.
<<<
***/
//{{{
	cur_twelem : null,
//}}}
/***
!!!! twve.tiddler.$edit_box
***/
//{{{
	$edit_box : null,
	getEditBox : function(){
		return twve.tiddler.$edit_box;
	},
	setEditBox : function($box){
		return (twve.tiddler.$edit_box = $box);
	},
//}}}
/***
!!!! twve.tiddler.$preview
***/
//{{{
	$preview : null,
//}}}
/***
!!!! twve.tiddler.getPreviewer
***/
//{{{
	getPreviewer : function($parent){
		if ( ! twve.tiddler.$preview ) {
			if ( ! $parent )
				$parent = twve.tiddler.getDisplay();
			twve.tiddler.$preview = jQuery(
				document.createElement('div')
				).appendTo($parent).css({
					'position':'absolute',
					'overflow':'auto',
					'z-index':1,
					'border':'1px solid black',
					'padding':0,
					'margin':0,
					'background-color':'#fff8dc'
				}).addClass('preview');
			jQuery(document.createElement('div'))
				.appendTo(twve.tiddler.$preview)
				.addClass('board viewer tiddler selected');
			twve.tiddler.$preview.hide();
		}
		return twve.tiddler.$preview;
	},
//}}}
/***
!!!! twve.tiddler.editInplace
***/
//{{{
	editInPlace : function (twelem,ev) {
		// This name was inherited from GridPlugin v2.0.7
		// (http://www.TiddlyTools.com/#GridPlugin) by
		// Eric Shulman, for that plugin is one of the two
		// seeds of this one.
		if ( ev && (ev.ctrlKey || ev.shiftKey || ev.altKey) ) {
			return false;
		}

		var editing = false;
		if ( ! twelem.tiddler ) {
			if ( twelem.wrapper_title )
				displayMessage(
					'tiddler['+twelem.wrapper_title+'] does not exist!'
				);
		} else {
			editing = twelem.editText(ev);
		}
		return editing;
	},
//}}}
/***
!!!! twve.tiddler.updateText
***/
//{{{
	updateText : function () {
		var twelem = twve.tiddler.cur_twelem;
		var $ta = twve.tiddler.getEditBox();
		if ( ! $ta || ! twelem ) {
			twve.tiddler.closeEditbox();
			twve.tiddler.cur_twelem = null;
			return;
		}
		var $elem = twelem.$dom;
		var canceled = false,
			done = false,
			modified = false,
			ctxt = null, txt;
		if ( $ta ) {
			ctxt = new Array();
			$ta.each(function(t,ta){
				var $cta = jQuery(ta);
				txt = $cta.val();
				ctxt.push(txt);
				if ( $cta.attr('cancel')=='true' )
					canceled = true;
				if ( ta.defaultValue != txt )
					modified = true;
			});
		}
		twve.tiddler.closeEditbox();
		if ( !canceled && modified )
			twelem.updateText(ctxt);
		twve.tiddler.cur_twelem = null;
	},
//}}}
/***
!!!! twve.tiddler.caretPosition
***/
//{{{
	caretPosition : function($ta, pos_start, pos_end) {
		if ( typeof pos_start == 'undefined' ) {
			// Get caret position
			try {
				if ( document.selection ) {
					// IE
					// The following codes are copied from
					// http://jsfiddle.net/FishBasketGordo/ExZM9/
					$ta[0].focus();
					var sel = document.selection.createRange();
					var sel_copy = sel.duplicate();
					sel_copy.moveToElementText($ta[0]);
					sel_copy.setEndPoint('EndToStart',sel);
					return sel_copy.text.length-sel.text.length;
				} else if ( $ta[0].selectionStart
							|| $ta[0].selectionStart == '0' )
					return $ta[0].selectionStart*1;
			} catch(e) {}
			return -1;
		} else {
			// Set caret position
			if ( typeof pos_start != 'number' )
				pos_start = 0;
			if ( typeof pos_end != 'number' )
				pos_end = pos_start;
			else if ( pos_start > pos_end ) {
				// Make sure that start < end
				var tmp = pos_start;
				pos_start = pos_end;
				pos_end = tmp;
			}

			// The following codes are copied from
			// http://www.webdeveloper.com/forum/showthread.php?74982-How-to-set-get-caret-position-of-a-textfield-in-IE
			if ( $ta[0].setSelectionRange ) {
				$ta.focus();
				$ta[0].setSelectionRange(pos_start,pos_end);
			} else if ( $ta[0].createTextRange ) {
				var range = $ta[0].createTextRange();
				range.collapse(true);
				range.moveEnd('character',pos_end);
				range.moveStart('character',pos_start);
				range.select();
			}
		}
	},
//}}}
/***
!!!! twve.tiddler.getSelectionText
***/
//{{{
	getSelectionText : function ( $ta ) {
		// This function is directly copied from
		// http://stackoverflow.com/questions/3053542/how-to-get-the-start-and-end-points-of-selection-in-text-area
		var target = $ta.jquery ? $ta[0] : $ta;
		var s = twve.object.create();
		s.start = 0;
		s.end = 0;
		if (typeof target.selectionStart == "number"
				&& typeof target.selectionEnd == "number") {
			// Firefox (and others)
			s.start = target.selectionStart;
			s.end = target.selectionEnd;
		} else if (document.selection) {
			// IE
			var bookmark =
				document.selection.createRange().getBookmark();
			var sel = target.createTextRange();
			var bfr = sel.duplicate();
			sel.moveToBookmark(bookmark);
			bfr.setEndPoint("EndToStart", sel);
			s.start = bfr.text.length;
			s.end = s.start + sel.text.length;
		}
		return s;
	},
//}}}
/***
!!!! twve.tiddler.closeEditbox
***/
//{{{
	closeEditbox : function() {
		if ( twve.tiddler.$preview )
			twve.tiddler.$preview.hide();
		if ( twve.tiddler.$edit_box ) {
			twve.tiddler.$edit_box.remove();
			twve.tiddler.$edit_box = null;
		}
	},
//}}}
/***
!!!! twve.tiddler.previewEditBox
***/
//{{{
	previewEditBox : function ($ta,cpos,tpos) {
		var $preview = twve.tiddler.getPreviewer();
		if ( ! config.options.chktwveCorePreview ) {
			$preview.hide();
			return null;
		}
		if ( typeof cpos != 'number' || cpos == -1 )
			cpos = twve.tiddler.caretPosition($ta);
		var txt = $ta.val();
		txt = cpos == 0
			? (config.options.txttwveCorePreviewCaret+txt)
			: (txt.substring(0,cpos)
				+config.options.txttwveCorePreviewCaret
				+txt.substring(cpos));
		var $board = $preview.show().find('div.board');

		// The $preview contains the font and color attributes of the
		// element being edited. I did not add the next line of code
		// until I found that the color attributes can go wrong in
		// some cases. One example is moving from one table cell with
		// a specific background color to one without, using keyboard
		// navigation.		2013/12/27 Vincent
		twve.node.copyFontColor($board,$preview);
		twve.node.wikify(txt,$board);
		if ( twve.tiddler.cur_twelem
			&& twve.tiddler.cur_twelem.isWrapper() ) {
			var twwrap = twve.tiddler.cur_twelem.clone();
			twwrap.$dom = $board;
			twwrap.waitAndPrepare();
		}

		// Adjust previewer height
		var h = new String(config.options.txttwveCorePreviewHeight)
					.toLowerCase().trim();
		var lh = twve.node.cssSize($board.css('line-height'));
		if ( /\D$/.test(h) )
			// txttwveCorePreviewHeight contains non-digits at
			// its end
			h = twve.node.cssSize(h);
		else
			// txttwveCorePreviewHeight is all digits
			h = lh*h;
		var bh = $board.height()+lh;
		if ( bh > h ) bh = h;
		if ( ! tpos )
			tpos = twve.node.offset($ta);
		if ( bh > tpos.top ) {
			bh = tpos.top;
			tpos.top = 0;
		} else
			tpos.top -= bh;
		$preview.height(bh);
		$preview.css({
			'top':tpos.top
		});
		return $preview
	},
//}}}
/***
!!!! twve.tiddler.caret_pos
***/
//{{{
	caret_pos : null,
	initCaretPos : function(pos){
		if ( ! twve.tiddler.caret_pos )
			twve.tiddler.caret_pos = twve.object.create();
		if ( pos === undefined ) pos = -100;
		twve.tiddler.caret_pos.cur = pos;
		twve.tiddler.caret_pos.last = pos;
	},
//}}}
/***
!!!! twve.tiddler.updateCaretPosition
***/
//{{{
	updateCaretPosition : function($ta,force){
		var cpos = twve.tiddler.caretPosition($ta);
		if ( force || cpos != twve.tiddler.caret_pos.cur ) {
			twve.tiddler.previewEditBox($ta,cpos);
		}
		twve.tiddler.caret_pos.last = twve.tiddler.caret_pos.cur;
		twve.tiddler.caret_pos.cur = cpos;
	},
//}}}
/***
!!!! twve.tiddler.keydownAfter
***/
//{{{
	keydownAfter : function (ev,$ta) {
		var $tas = twve.tiddler.getEditBox();
		if ( ev.which == 27 ) {
			$tas.attr ('cancel', 'true');
			twve.tiddler.updateText();
			return false;
		}
		if ( ! twve.tiddler.cur_twelem ) return false;

		var force = false;
		switch ( ev.which ) {
			case 46 : // delete
				force = true;
			case 8 : // backspace
				if ( ev.alterKey ) return false;
				twve.tiddler.updateCaretPosition($ta,force);
				break;
			case 33 : // page up
			case 34 : // page down
			case 35 : // end
			case 36 : // home
			case 37 : // left arrow
			case 38 : // up arrow
			case 39 : // right arrow
			case 40 : // down arrow
				if ( ev.alterKey ) return false;
				if ( ev.shiftKey ) {
					// Selection made. Think about what to do...
					return false;
				}
				twve.tiddler.updateCaretPosition($ta,force);
				break;
			default :
				// Adjust the edit box height to fit its containing
				// text.

				// It is interesting that with Chrome, FireFox,
				// and Safari we need to change the height of $ta
				// to get the correct scrollHeight, while with IE9
				// we get it no matter what. The scrH0 is the minimum
				// height that we stored upon initialization.
				var tah = Math.round($ta.height());
				$ta.height(0);
				var scrH0 = $ta.attr('scrH0')*1;
				var scrH = $ta.prop('scrollHeight');
				scrH = Math.max(scrH, scrH0);
				$ta.height(scrH);
				twve.tiddler.previewEditBox($ta);
				break;
		}
		return true;
	},
//}}}
/***
!!!! twve.tiddler.keydown
***/
//{{{
	keydown : function (ev) {
		ev = ev || window.event;
		var $ta = jQuery(this);
		var twelem = twve.tiddler.cur_twelem;
		switch ( ev.which ) {
			case 13 :
				if ( twelem.multiLine($ta.val()) ) {
					if (ev.ctrlKey) {
						twve.tiddler.updateText();
						return false;
					} else if ( twve.tiddler.caret_pos.cur == 0 ) {
						twve.tiddler.caret_pos.cur++;
					}
				} else {
					twve.tiddler.updateText();
					return false;
				}
			default :
				setTimeout(function(){
					twve.tiddler.keydownAfter(ev,$ta);
				}, 0);
		}
	},
//}}}
/***
!!!! twve.tiddler.textPasted
***/
//{{{
	text_before_paste : null,
	selection_at_paste : null,
	textPasted : function($ta){
		var txt = $ta.val();
		if ( txt ) {
			var len = txt.length
					- twve.tiddler.text_before_paste.length
					+ twve.tiddler.selection_at_paste.end
					- twve.tiddler.selection_at_paste.start;
			txt = txt.substring(
				twve.tiddler.selection_at_paste.start,
				twve.tiddler.selection_at_paste.start+len
			);
		}
		return txt;
	},
//}}}
/***
!!!! twve.tiddler.paste
***/
//{{{
	paste : function () {
		// Something pasted from outside of this tiddler. Need to find
		// the paste-in text and replace \n with <br>.
		// From http://stackoverflow.com/questions/686995/jquery-catch-paste-input
		// I learned that the paste-in text can be obtained in the
		// next event loop.
		if ( ! twve.tiddler.text_before_paste ) {
			var $ta = jQuery(this);
			twve.tiddler.text_before_paste = $ta.val();
			twve.tiddler.selection_at_paste =
				twve.tiddler.getSelectionText($ta);
			setTimeout(function() {
				if ( twve.tiddler.cur_twelem.pasteIn )
					twve.tiddler.cur_twelem.pasteIn($ta);
				twve.tiddler.text_before_paste = null;
			}, 0);
		}
	},
//}}}
/***
!!!! twve.tiddler.copyOrCut
***/
//{{{
	copyOrCut : function(cut){
		var $ta = jQuery(this);
		//setTimeout(function() {
			if ( twve.tiddler.cur_twelem.copyOrCut )
				twve.tiddler.cur_twelem.copyOrCut($ta,cut);
		//}, 0);
	},
//}}}
/***
!!!! twve.tiddler.editHandler
***/
//{{{
	preEditHandler : null,
	editHandler : function(ev,src,title) {
		twve.tiddler.updateText();
		twve.tiddler.preEditHandler.apply(this,arguments);
		return false;
	},
//}}}
/***
!!!! twve.tiddler.closeHandler
***/
//{{{
	preCloseHandler : null,
	closeHandler : function () {
		twve.tiddler.updateText();
		twve.tiddler.focus();
		return twve.tiddler.preCloseHandler.apply(this,arguments);
	},
//}}}
/***
!!!! twve.tiddler.closeAllHandler
***/
//{{{
	preCloseAllTiddlers : null,
	closeAllTiddlers : function () {
		twve.tiddler.updateText();
		twve.tiddler.focus();
		twve.tiddler.preCloseAllTiddlers.apply(this,arguments);
	},
//}}}
/***
!!!! twve.tiddler.saveHandler
***/
//{{{
	preSaveHandler : null,
	saveHandler : function (event,src,title) {
		twve.tiddler.updateText();
		var result = twve.tiddler.preSaveHandler.apply(
			this,arguments
		);
		return result;
	},
//}}}
/***
!!!! twve.tiddler.cancelHandler
***/
//{{{
	preCancelHandler : null,
	cancelHandler : function (ev,src,title) {
		if(store.isDirty() && !readOnly) {
			if(!confirm(this.warning.format([title])))
				return false;
		}
		return twve.tiddler.preCancelHandler.apply(this,arguments);
	},
//}}}
/***
!!!! twve.tiddler.saveHandler
***/
//{{{
	preSaveChanges : null,
	saveChanges : function () {
		twve.tiddler.preSaveChanges.apply(this,arguments);
		if ( config.macros.upload ) {
			config.macros.upload.action();
		}
	}
};
//}}}
/***
!!! twve.tags
***/
//{{{
twve.tags = {
//}}}
/***
!!!! twve.tags.create
***/
//{{{
	create : function(src,close){
		var tags = twve.object.create();
		// clear
		tags.clear = function(){
			tags.open = null;
			tags.close = null;
			return tags;
		};
		// identicalPair
		tags.identicalPair = function(){
			return tags.open == tags.close;
		};
		// exactCloseTag
		tags.exactCloseTag = function(start){
			if ( start.matched
				&& (typeof tags.open == 'object')
				&& (typeof tags.close == 'object') ) {
				var open = start.matched;
				var close = tags.close[tags.open.indexOf(open)];
				return tags.clone
					? tags.clone(open,close)
					: twve.tags.create(open,close);
			}
			return tags;
		};
		// nextOpenTag
		tags.nextOpenTag = function(txt,start,strict) {
			if ( ! strict && typeof tags.open == 'string' ) {
				var p0 = start.ndx, p1;
				start = twve.text.indexOf(txt,tags.open,start);
				if ( /^\{\{\w+\{/.test(tags.open) ) {
					// Searching for a class wrapper.
					p1 = txt.indexOf('{{', p0);
					if ( p1 > -1 ) {
						if ( txt.charAt(p1+2)=='{' )
							p1 = -1;
						else if ( start.ndx == -1
								|| p1 < start.ndx ) {
							start.ndx = p1;
							start.matched = '{{';
						}
					}
				} else if ( /^<\w+ class/.test(tags.open) ) {
					// Searching for an element
					var open = tags.open.substring(
						0,tags.open.indexOf(' ')
					);
					p1 = txt.indexOf(open, p0);
					if ( p1>-1
						&& (start.ndx==-1 || p1<start.ndx) ) {
						start.ndx = p1;
						start.matched = open;
					}
				}
			} else
				start = twve.text.indexOf(txt,tags.open,start);

			if ( start.ndx > -1 && /^[\n]/.test(start.matched) )
				start.ndx++;
			return start;
		};
		// lastCloseTag
		tags.lastCloseTag = function(txt,end){
			var txtlen = txt.length;
			var clen = tags.close.length;
			if( tags.close.charAt(clen-1)=='\n' &&
				txt.charAt(txtlen-1) != '\n' ) {
				// The close tag expects an ending \n, while the txt
				// does not have one at the end.
				var close = tags.close.substring(0,--clen);
				if ( txt.substring(txtlen-clen) == close )
					end.matched = close;
			}
			return end;
		}
		// nextCloseTag
		tags.nextCloseTag = function(txt,end){
			end = twve.text.indexOf(txt,tags.close,end);
			if ( end.ndx > -1 ) {
				end.ndx += end.matched.length;
			} else {
				tags.lastCloseTag(txt,end);
			}
			return end;
		};
		// closeTagEnds
		tags.closeTagEnds = function (txt,end) {
			if ( /\n$/.test(end.matched) )
				end.ndx--;
			return end;
		};
		// matchedCloseTag
		tags.matchedCloseTag = function(txt,start){
			var remained = 1;
			var end = twve.position.create(start.ndx, tags.close);
			do {
				start = tags.nextOpenTag(txt,start);
				end = tags.nextCloseTag(txt,end);
				if ( end.ndx == -1 ) {
					// No more closing tags, stop searching.
					return twve.text.exhausted(txt,end,remained);
				}

				if ( start.ndx == -1 ) {
					// No more opening tags. Check for remaining closing
					// tags.
					do {
						if ( --remained == 0 ) {
							return tags.closeTagEnds(txt,end);
						}
						end = tags.nextCloseTag(txt,end);
						if ( end.ndx == -1 )
							return twve.text.exhausted(
								txt,end,remained
							);
					} while ( true );
				}

				if ( end.ndx == start.ndx ) {
					if ( --remained == 0 ) {
						// This situation is possible for elements that
						// must start from the beginning of line and
						// end at line break, such as list items.
						return tags.closeTagEnds(txt,end);
					}
				} else if ( end.ndx < start.ndx ) {
					// The next closing tag is before the next opening
					// tag. Check if done before the next opening tag.
					do {
						if ( --remained == 0 ) {
							return tags.closeTagEnds(txt,end);
						}
						end = tags.nextCloseTag(txt,end);
						if ( end.ndx == -1 )
							return twve.text.exhausted(
								txt,tags,remained
							);
					} while ( end.ndx < start.ndx );
					++remained;
					//start.ndx += start.matched.length;
					start.ndx++;
					end.ndx = start.ndx;
				} else { // end.ndx > start.ndx
					// The next opening tag is before the next closing
					// tag. Look for more opening tags before the next
					// closing tag.
					do {
						++remained;
						start.ndx += start.matched
							? start.matched.length
							: 1;
						start = tags.nextOpenTag(txt,start);
					} while ( start.ndx > -1 && start.ndx < end.ndx );
					--remained;
					start.ndx = end.ndx;
				}
			} while (true);
		};
		// encloses
		tags.encloses = function(txt,ndx,start,end){
			// Tests whether this pair of tags encloses the index ndx
			// in txt. The last two arguments, start and end, stand for
			// the starting and ending indexes of the search.
			// If this pair of tags does enclose the index, this function
			// returns a twve.position object containing
			//		{
			//			ndx: the index of the close tag,
			//			matched: the matched close tag
			//		}.
			// Otherwise it returns null.

			if ( ! tags.open || ! tags.close
				|| ndx == 0 || ndx >= txt.length-1 )
				return null;
			start = twve.position.create(start);
			end = twve.position.create(end);
			if ( start.ndx < 0 ) start.ndx = 0;
			if ( end.ndx <= start.ndx || end.ndx > txt.length )
				end.ndx = txt.length;
			var pos = twve.position.create(ndx-1);
			pos = twve.text.lastIndexOf(txt,tags.open,pos);
			if ( pos.ndx < start.ndx ) return null;
			var exactTag = tags.exactCloseTag(pos);
			if ( exactTag.identicalPair() ) return null;
			pos.ndx += pos.matched.length;
			if ( pos.ndx > ndx ) return null;
			pos = twve.text.indexOf(txt,exactTag.close,pos);
			return (pos.ndx >= ndx && pos.ndx < end.ndx) ? pos : null;
		};
		// mergeTag
		tags.mergeTag = function(tag,newtag){
			// Merges newtag into tag
			if ( typeof tag == 'string' ) {
				// tag is string
				if ( typeof newtag == 'string' ) {
					// newtag is also string
					if ( tag != newtag )
						tag = new Array(tag,newtag);
				} else {
					// newtag is an array
					tag = [tag];
					for (var i=0; i<newtag.length; i++)
						if ( tag.indexOf(newtag[i]) == -1 )
							tag.push(newtag[i]);
				}
			} else {
				// tag is an array
				if ( typeof newtag == 'string' ) {
					// newtag is a string
					if ( tag.indexOf(newtag) == -1 )
						tag.push(newtag);
				} else {
					// newtag is also an array
					for (var i=0; i<newtag.length; i++)
						if ( tag.indexOf(newtag[i]) == -1 )
							tag.push(newtag[i]);
				}
			}
			return tag;
		};
		// merge
		tags.merge = function(t){
			// Merges the open and close tags from t (twve.tags object)
			// into this one.
			tags.open = tags.mergeTag(tags.open,t.open);
			tags.close = tags.mergeTag(tags.close,t.close);
			return tags;
		};
		// End of definitions.
		if ( close ) {
			// If the 2nd argument close is given, it shall be the
			// close tag, and the 1st argument shall be the open tag.
			tags.clear();
			tags.open = src;
			tags.close = close;
			return tags;
		} else
			// Otherwise we follow the default behavior.
			return tags.created(src);
	}
};
//}}}
/***
!!! twve.position
***/
//{{{
twve.position = {
//}}}
/***
!!!! twve.position.init
***/
//{{{
	init : function(twpos,pos,matched){
		switch ( typeof pos ) {
			case 'number' :
				twpos.ndx = (pos<0?0:pos);
				twpos.matched = matched;
				break;
			case 'object' :
				twpos.ndx = (pos.ndx<0?0:pos.ndx);
				twpos.matched = pos.matched;
				break;
			default :
				twpos.clear();
				break;
		}
		return twpos;
	},
//}}}
/***
!!!! twve.position.ensureValid
***/
//{{{
	ensureValid : function(twpos,pos){
		// Ensure the validity of the position index, i.e.,
		// make sure that twpos.ndx is non-negative.
		// The first argument twpos MUST be a twve.position object.
		if ( pos ) {
			// Copy from pos
			twve.position.init(twpos,pos);
		}
		if ( twpos.ndx < 0 ) twpos.ndx = 0
		return twpos;
	},
//}}}
/***
!!!! twve.position.create
***/
//{{{
	create : function(pos,matched){
		var _pos = twve.object.create();

		_pos.clear = function() {
			_pos.ndx = -1;
			_pos.matched = '';
			return _pos;
		};

		_pos.init = function(pos,matched){
			return twve.position.init(_pos,pos,matched);
		};

		_pos.ensureValid = function(pos){
			return twve.position.ensureValid(_pos,pos);
		};

		return _pos.init(pos,matched);
	}
};
//}}}
/***
!!! twve.selector
***/
//{{{
twve.selector = {
//}}}
/***
!!!! twve.selector.create
***/
//{{{
	create : function(src,exc) {
		var sel = twve.object.create();
		sel.clear = function() {
			sel.include = '';
			sel.exclude = '';
			return sel;
		};

		sel.copyFrom = function(src,exc){
			if ( typeof exc == 'string' ) {
				// The 2nd argument is given, both of them
				// are expected to be strings.
				sel.include = src;
				sel.exclude = exc;
				return sel;
			} else if ( src.include ) {
				// src is a twve.selector object
				sel.include = src.include;
				sel.exclude = src.exclude;
				return sel;
			} else if ( src.$dom ) {
				// src is a twve.element object
				sel.include = src.selector.include;
				sel.exclude = src.selector.exclude;
				return sel;
			}
			// src is expected to be a jQuery object.
			src = twve.tiddler.twveSelector(src);
			if ( src ) {
				sel.include = src.include;
				sel.exclude = src.exclude;
			}
			return sel;
		};
		// include
		sel.includeSelector = function(inc){
			if ( inc )
				sel.include += (sel.include?',':'')+inc;
			return sel.include;
		};
		// exclude
		sel.excludeSelector = function(exc){
			if ( exc )
				sel.exclude += (sel.exclude?',':'')+exc;
			return sel.exclude;
		};

		sel.clear();
		return (src || exc) ? sel.copyFrom(src,exc) : sel;
	}
};
//}}}
/***
!!! twve.text
***/
//{{{
twve.text = {
//}}}
/***
!!!! twve.text.tiddlerSlice
***/
//{{{
	tiddlerSlice : function(title) {
		if ( ! title ) return '';
		var p = title.indexOf(config.textPrimitives.sliceSeparator);
		return p > -1
			? title.substring
				(p+config.textPrimitives.sliceSeparator.length)
			: '';
	},
//}}}
/***
!!!! twve.text.sectionTitle
***/
//{{{
	sectionTitle : function(sec) {
		// Skip the leading !'s and white spaces.
		// This is added after 2.0.9
		var ps = 0;
		for ( ; /[! \t]/.test(sec.charAt(ps)); ps++ ) {}
		return ps > 0 ? sec.substring(ps) : sec;
	},
//}}}
/***
!!!! twve.text.tiddlerSection
***/
//{{{
	tiddlerSection : function ( title ) {
		if ( ! title ) return '';
		var p = title.indexOf(config.textPrimitives.sectionSeparator);
		if ( p > -1 ) {
			var sec = title.substring(
				p + config.textPrimitives.sectionSeparator.length
			);
			// Skip the leading !'s and white spaces.
			sec = twve.text.sectionTitle(sec);
			// Restore &mdash; (8212=\u2014) back to double dash.
			return sec.replace('\u2014','--');
		}
		return '';
	},
//}}}
/***
!!!! twve.text.tiddlerTitle
***/
//{{{
	tiddlerTitle : function ( title ) {
		if ( ! title ) return '';
		var p = title.indexOf(config.textPrimitives.sectionSeparator);
		if ( p == -1 )
			p = title.indexOf(config.textPrimitives.sliceSeparator);
		return p > -1 ? title.substring(0,p) : title;
	},
//}}}
/***
!!!! twve.text.headerToSkip
***/
//{{{
	headerToSkip : function(title){
		var pq = title.lastIndexOf('?');
		if ( pq > 0	&& pq < title.length-1 ) {
			var to_skip = title.substring(pq+1);
			if ( /^\d$/.test(to_skip) )
				return to_skip*1;
		}
		return 0;
	},
//}}}
/***
!!!! twve.text.removeHeaderTail
***/
//{{{
	removeHeaderTail : function (title) {
		var pq = title.lastIndexOf('?');
		if ( pq > 0	&& pq < title.length-1
				&& ! /[\D]/.test(title.substring(pq+1)) ) {
			title = title.substring(0,pq);
		}
		return title;
	},
//}}}
/***
!!!! twve.text.lastIndexOf
***/
//{{{
	lastIndexOf : function(str,val,start){
		// Search the last index of val in str, starting from start.ndx.
		// (The 3rd argument start MUST be a twve.position object.)
		// The being searched val could be a string or an array of
		// strings.
		// If val is a string, it simply returns
		// str.lastIndexOf(val,start.ndx).
		// If, however, val is an array of strings, the function
		// compares all the elements in the array and considers it
		// found if any of the elements is found.
		// Returns a twve.object object containing the following
		// information:
		//		{
		//			ndx:		last index of val found, -1 otherwise.
		//			matched:	the matched string
		//		}

		if ( typeof val == 'string' ) {
			start.ndx = str.lastIndexOf(val,start.ndx);
			start.matched = start.ndx > -1 ? val : '';
		} else {
			var ndx = new Array(), i;
			for ( i = 0; i < val.length; i++ )
				ndx[i] = str.lastIndexOf(val[i],start.ndx);
			start.ndx = ndx[0];
			start.matched = start.ndx > -1 ? val[0] : '';
			for ( i = 1; i < val.length; i++ ) {
				if ( ndx[i] == -1 ) continue;
				if ( start.ndx == -1 || ndx[i] > start.ndx ) {
					start.ndx = ndx[i];
					start.matched = val[i];
				}
			}
		}
		return start;
	},
//}}}
/***
!!!! twve.text.indexOf
***/
//{{{
	indexOf : function (str, val, start) {
		// Search the index of val in str.
		// The being searched val could be a string or an array of
		// strings.
		// If val is a string, it simply returns
		// str.indexOf(val,start.ndx). If, however, val is an array
		// of strings, the function compares all the elements in the
		// array and considers it found if any of the elements is
		// found.
		// Returns a twve.position object containing the following
		// information:
		//		{
		//			ndx:		index of val found, -1 otherwise.
		//			matched:	the matched string
		//		}

		if ( typeof val == 'string' ) {
			start.ndx = str.indexOf(val,start.ndx);
			start.matched = start.ndx > -1 ? val : '';
		} else {
			var ndx = new Array(), i;
			for ( i = 0; i < val.length; i++ )
				ndx[i] = str.indexOf(val[i],start.ndx);
			start.ndx = ndx[0];
			start.matched = start.ndx > -1 ? val[0] : '';
			for ( i = 1; i < val.length; i++ ) {
				if ( ndx[i] == -1 ) continue;
				if ( start.ndx == -1 || ndx[i] < start.ndx ) {
					start.ndx = ndx[i];
					start.matched = val[i];
				}
			}
		}
		return start;
	},
//}}}
/***
!!!! twve.text.inactive
***/
//{{{
	inactive : function(text,start){
		// Check whether or not an element starting at start
		// (teve.position object) is in an inactive region of text.
		// Inactive regions include preformatted or code blocks, and
		// maybe other plugin-defined regions.
		// If true, returns a twve.position object containing
		//	{
		//		ndx:		the end position of inactive region,
		//		matched:	the close tag of the inactive region.
		//	}
		// Otherwise returns null.

		return twve.pre.wikiTags().merge(
			twve.code.wikiTags()
		).encloses(text,start.ndx);
	},
//}}}
/***
!!!! twve.text.consecutiveLinesEnd
***/
//{{{
	consecutiveLinesEnd : function (txt,start,alltheway){
		// This function is shared by Table and Blockquote for their
		// "consecutive lines" characteristic: a single Table or
		// Blockquote can be defined by one or more consecutive lines
		// of text with the same opening signature. This function
		// searches the end of the last line.
		// Arguments:
		//	txt:		tiddler text
		//	start:		starting position to search, can be either
		//				1. a twve.position object, or
		//				2. a number
		//	alltheway	True to go beyond any immediately following
		//				sub-blockquotes. This is specifically for
		//				blockquote that contain sub-blockquotes within
		//				its body. For example,
		//
		//				> Blockquote starts here
		//				> The second line
		//				>> A sub blockquote immediately follows here
		//				>> and ends here
		//				> Back to the parent blockquote
		//				> End of the parent blockquote
		//
		//				For blockquotes like the example above, the
		//				end of the parent blockquote exceeds that of
		//				its sub-blockquote.
		//
		//				When search for the end of the parent
		//				blockquote, we go "all the way" to the last
		//				line. When search for the beginning of the
		//				sub blockquote, however, we do not go all
		//				the way to the end of parent.

		var p0 = start;
		if ( typeof start != 'number' )
			p0 = start.ndx ? start.ndx : 0;
		if ( txt.charAt(p0) == '\n' )
			p0++;
		else
			while ( p0 > 0 && txt.charAt(p0-1) != '\n' ) p0--;
		// p0 should point at the first non-blank character of a
		// leveled element
		var level = twve.leveledElement.getLevel(txt,p0);
		var end = twve.position.create(p0,'\n');
		end.ndx = txt.indexOf(end.matched,p0);
		if ( end.ndx == -1 ) {
			end.ndx = txt.length;
			end.matched = '';
			return end;
		}
		var tags = twve.tags.create(
			('\n'+txt.substring(p0,p0+level)), '\n'
		);
		do {
			//p0 = end.ndx; //+tags.close.length-1;
			p0 = txt.indexOf(tags.open,end.ndx);
			// Break if
			//	1.	not an immediately following line,
			//	2.	not the same level && not alltheway
			if ( p0 != end.ndx ||
				(twve.leveledElement.getLevel(txt,p0+1)!=level
					&& ! alltheway) )
				break;
			// The next leveled element at the next line has the same
			// level as this one.
			end.ndx = txt.indexOf(tags.close,p0+tags.open.length);
			if ( end.ndx == -1 ) {
				end.ndx = txt.length;
				end.matched = '';
				break;
			}
		} while ( true );
		return end;
	},
//}}}
/***
!!!! twve.text.exhausted
***/
//{{{
	exhausted : function(txt,end,remained){
		//end.ndx = /\n$/.test(end.matched)
		//			? (remained == 1 ? txt.length : -remained)
		//			: -remained;
		end.ndx = remained == 1 ? txt.length : -remained;
		return end;
	},
//}}}
/***
!!!! twve.text.skipStyleText
***/
//{{{
	skipStyleText : function ( wikitxt ) {
		// Find the position of the first character of the content
		// in the wikitext. A wikitext may contain style text at the
		// beginning, then followed by its content. This function is
		// to find the index of the content's starting character.

		// A style text in a table cell must start immediately after
		// the beginning '|' that defines that table cell. If the
		// wikitxt starts with a blank space then it does not
		// contain any style text. If the wikitxt does contain a
		// style text, then the style text must follow the
		// "attribute:value;" format, in which a colon is inserted
		// between attribute and the value text, while a semicolon
		// is added to the end of the style text. Therefore to
		// identify a style text one needs to
		// 1) make sure the wikitxt does not start with a blank space;
		// 2) look for the existence of colon-semicolon pairs.

		if ( ! wikitxt.length || /^[ @]/.test(wikitxt) )
			return 0;

		var p = 0, pcolon, pat, psemicolon;
		// First character is not a blank space, check if style text
		// exists.
		do {
			pcolon = wikitxt.indexOf ( ':', p + 1 );
			if ( pcolon > 0 ) {
				// Found one colon, mkae sure it's not within a "@@ @@" pair.
				pat = wikitxt.indexOf ( "@@", p );
				if ( pat >= 0 && pat < pcolon )
					// This colon is within a "@@ @@" pair, meaning it is
					// part of the content text, not a style text for the
					// whole cell.
					return p;
				// The colon is not within a "@@ @@" pair, look for the
				// following semicolon.
				psemicolon = wikitxt.indexOf ( ';', pcolon+1 );
				if ( psemicolon > pcolon ) {
					// Found a colon-semicolon pair, check in-between to
					// make sure a valid style text is found. A valid
					// style text should NOT contain comma, period, and
					// white space characters.
					if(/[\s\,\.]/.test(
						wikitxt.substring(pcolon+1,psemicolon)))
						return p;
					// Look for the next style text.
					p = psemicolon + 1;
				} else	// No colon-semicolon pair found
					return p;
			} else	// No colon-semicolon pair found
				return p;
		} while ( true );
	},
//}}}
/***
!!!! twve.text.removeStyleText
***/
//{{{
	removeStyleText : function ( wikitxt ) {
		// Remove the style text in the wiki text.
		if ( ! wikitxt ) return '';
		var p = twve.text.skipStyleText ( wikitxt );
		return p < wikitxt.length ? wikitxt.substring(p) : '';
	},
//}}}
/***
!!!! twve.text.elemWideStyleText
***/
//{{{
	elemWideStyleText : function ( ctxt ) {
		// Returns the cell-wide style text, if any.
		var p = twve.text.skipStyleText ( ctxt );
		return (p>0 ? ctxt.substring(0,p) : '');
	}
};
//}}}
/***
!!! twve.box
***/
//{{{
twve.box = {
//}}}
/***
!!!! twve.box.create
***/
//{{{
	create : function(){
		var box = twve.object.create();
		// clear
		box.clear = function(){
			box.left = 0;
			box.right = 0;
			box.top = 0;
			box.bottom = 0;
			return box;
		};
		// contains
		box.contains = function(pos){
			return (pos.x >= box.left && pos.x <= box.right
				&& pos.y >= box.top && pos.y <= box.bottom);
		}
		return box.clear();
	}
};
//}}}
/***
!!! twve.node
***/
//{{{
twve.node = {
//}}}
/***
!!!! twve.node.info
***/
//{{{
	info : function(node){
		var $node, msg;
		if ( node.jquery ) {
			$node = node; msg = '$('+$node.size()+')';
		} else {
			$node = jQuery(node); msg = '';
		}
		return msg + ($node.size()>0?$node[0].nodeName:'none');
	},
//}}}
/***
!!!! twve.node.is
***/
//{{{
	is : function(elem,node){
		if ( ! elem || ! node ) return false;
		var $elem = elem.$dom ? elem.$dom : elem;
		return $elem.is(node.$dom);
	},
//}}}
/***
!!!! twve.node.offset
***/
//{{{
	offset : function ($node) {
		var twpos = twve.object.create();
		twpos.top = 0;
		twpos.left = 0;
		if ( ! $node || $node.size() == 0 ) {
			return twpos;
		}

		var pos = $node.offset();
		// If the displayArea does not have position:static CSS style,
		// the offset positions are incorrect shifted. Need to correct
		// it here.
		var $display = $node.closest(twve.tiddler.displaySelector());
		if ( $display && $display.css('position') != 'static' ) {
			var dpos = $display.offset();
			if ( dpos ) {
				pos.left -= dpos.left;
				pos.top -= dpos.top;
			}
		}
		if ( pos ) {
			twpos.left = pos.left;
			twpos.top = pos.top;
		}
		return twpos;
	},
//}}}
/***
!!!! twve.node.box
***/
//{{{
	box : function($node,outerw,outerh) {
		var nb = twve.box.create();
		if ( $node[0].nodeType == 3 ) {
			// text node
			var r = document.createRange();
			r.selectNode($node[0]);
			r = r.getClientRects();
			nb.left = r.left;
			nb.top = r.top;
			nb.right = r.right;
			nb.bottom = r.bottom;
			nb.width = (r.right-r.left);
			nb.height = (r.bottom-r.top);
		} else {
			// element
			var pos = twve.node.offset($node);
			var w = outerw
				? $node.outerWidth(true)
				: ($node[0].clientWidth || $node.width());
			var h = outerh
				? $node.outerHeight(true)
				: ($node[0].clientHeight || $node.height());
			nb.left = pos.left;
			nb.top = pos.top;
			nb.right = (pos.left+w);
			nb.bottom = (pos.top+h);
			nb.width = w;
			nb.height = h;
		}
		return nb;
	},
//}}}
/***
!!!! twve.node.cssSize
***/
//{{{
	cssSize : function (txt, $node) {
		if ( ! txt )
			return $node
				? parseFloat($node.css('font-size'))
				: 0;

		// See http://twtable.tiddlyspace.com/#[[Tax%20for%20text%20options]]
		// for a description on the change made to the next statement.
		// txt = txt.toLowerCase();
		txt = new String(txt).toLowerCase().trim();
		var unit = txt.substring(txt.length-2);
		switch ( unit ) {
			case 'px' :
				return Math.round(parseFloat(txt));
			case 'pt' :
				return Math.round(parseFloat(txt)*16/12);
			default :
				var size = parseFloat(txt);
				var $e = $node
					? $node
					: jQuery(document).find('div[id=tiddlerDisplay]');

				if ( isNaN(size) )
					return twve.node.cssSize($e.css(txt),$e);

				if ( unit == 'em' ) {
					return Math.round(
						size*parseFloat($e.css('font-size'))*16/12
					);
				}
				if (unit.charAt(1)=='%')
					return Math.round(size/100*$e.width());

				return size;
		}
	},
//}}}
/***
!!!! twve.node.copyFontColor
***/
//{{{
	copyFontColor : function ($dest, $src, va) {
		if ( ! va ) va = $src.css('vertical-align');
		var bkc = $src.css('background-color');
		switch ( bkc ) {
			case 'transparent' :
			case 'rgba(0, 0, 0, 0)' :
			case 'inherit' :
				bkc = twve.node.bgc($src);
			default :
				$dest.css('background-color', bkc);
				break;
		}
		$dest.css({
			'font-size':$src.css('font-size')
			,'font-family':$src.css('font-family')
			,'font-style':$src.css('font-style')
			,'color':$src.css('color')
			,'text-align':$src.css('text-align')
			,'vertical-align':va
		});
	},
//}}}
/***
!!!! twve.node.bgc
***/
//{{{
	bgc : function ($e) {
		// Returns the background color of a node $e
		var bgc;
		while ( (bgc=$e.css('background-color'))=='transparent'
					|| bgc == 'rgba(0, 0, 0, 0)'
					|| bgc == 'inherit' ) {
			$e = $e.parent();
			if ( $e.size() == 0 ) {
				bgc = '#fff';
				break;
			}
		}
		return bgc;
	},
//}}}
/***
!!!! twve.node.wikify
***/
//{{{
	wikify : function ( txt, $node ) {
		// Wikifies txt into $node if given, or into a newly created
		// $node if not. Returns the $node being wikified.
		if(! $node) {
			$board = twve.tiddler.getPreviewer().find('div.board');
			$board.empty();
			wikify(txt, $board[0]);
			$node = $board.contents();
		} else {
			$node.empty();
			wikify(txt,$node[0]);
		}
		return $node;
	},
//}}}
/***
!!!! twve.node.create
***/
//{{{
	create : function(src){
		var node = twve.object.create();
		// clear
		node.clear = function(){
			// jQuery object of the DOM element
			node.$dom = null;
			return node;
		};
		// copy from
		node.copyFrom = function(obj){
			node.$dom = obj.$dom;
			return node;
		};
		// is
		node.is = function(elem){
			return twve.node.is(elem,node);
		};
		// hide
		node.hide = function(){
			node.$dom.hide();
			return node;
		};
		// show
		node.show = function(pos){
			node.$dom.show();
			if ( pos ) {
				node.$dom.css({
					left: pos.left,
					top: pos.top
				});
			}
			return node;
		};
		// isVisible
		node.isVisible = function(){
			return node.$dom[0].style.display != 'none';
		};
		// width
		node.width = function(w){
			if ( typeof w == 'undefined' ) {
				if ( ! node.isVisible() ) {
					node.$dom.show();
					w = node.$dom.outerWidth(true);
					node.$dom.hide();
				} else {
					w = node.$dom.outerWidth(true);
				}
			} else {
				node.$dom.width(w);
			}
			return w;
		};
		// height
		node.height = function(h){
			if ( typeof h == 'undefined' ) {
				if ( ! node.isVisible() ) {
					node.$dom.show();
					h = node.$dom.outerHeight(true);
					node.$dom.hide();
				} else {
					h = node.$dom.outerHeight(true);
				}
			} else {
				node.$dom.height(h);
			}
			return h;
		};
		// get element
		node.getElement = function(){
			return node.$dom;
		};
		// box
		node.box = function(){
			return twve.node.box(node.getElement());
		};
		// contains
		node.contains = function(elemOrPos){
			if ( elemOrPos.x )
				return twve.node.box(
					node.getElement(),true,true
				).contains(elemOrPos);
			var elem = elemOrPos.jquery
				? elemOrPos[0]
				: (elemOrPos.nodeName
					? elemOrPos
					: (elemOrPos.$dom
						? elemOrPos.$dom[0]
						: null));
			return elem
				? jQuery.contains(node.$dom[0],elem)
				: false;
		};
		// end of definitions
		node.clear();
		switch ( typeof src ) {
			case 'string' :
				node.$dom = jQuery(document.createElement(src));
				break;
			case 'object' :
				if ( src.$dom )
					node.copyFrom(src);
				else if ( src.jquery )
					node.$dom = src;
				else if ( src.nodeName )
					node.$dom = jQuery(src);
				break;
		}
		return node;
	}
};
//}}}
/***
!!! twve.button
***/
//{{{
twve.button = {
	isSystemButton : function ($elem) {
		return $elem.is(
			'svg.SVGAnimatedString, path.SVGAnimatedString'
		);
	},
//}}}
/***
!!!! twve.button.isActive
***/
//{{{
	isActive : function ( $btn ) {
		return $btn.css('opacity')=='1';
	},
//}}}
/***
!!!! twve.button.activate
***/
//{{{
	activate : function ( $btn, tf ) {
		return $btn.fadeTo('fast', (tf?1:0.4));
	},
//}}}
/***
!!!! twve.button.create
***/
//{{{
	create : function (place, label, tooltip, callback, id) {
		var btn = twve.node.create(
			createTiddlyButton(place,label,tooltip,callback)
		);
		// isActive
		btn.isActive = function (){
			return btn.$dom.css('opacity')=='1';
		};
		// activate
		btn.activate = function(tf){
			return twve.button.activate(btn.$dom,tf);
		};
		// end of definitions
		btn.$dom.attr('id','twveTbtn'+(id?id:label)).css({
			'position':'absolute',
			'z-index':1,
			'text-align':'center'
		});
		btn.$dom.mouseenter(function(ev){
			if ( btn.mouseenter )
				btn.mouseenter.call(this,ev || window.event);
		}).mouseleave(function(ev){
			if ( btn.mouseleave )
				btn.mouseleave.call(this,ev || window.event);
		}).click(function(ev){
			if ( btn.click )
				btn.click.call(this,ev || window.event);
		})
		// end of creation
		return btn;
	},
//}}}
/***
!!!! twve.button.createDelete
***/
//{{{
	createDelete : function ( tooltip, callback, id ) {
		return twve.button.create(null, '⊗',tooltip,callback,id);
	}
};
//}}}
/***
!!! twve.menu
***/
//{{{
twve.menu = {
//}}}
/***
!!!! twve.menu.create
***/
//{{{
	create : function(root,autohide){
		// Create twve.menu object that will be attached to root, which
		// can be an object of one of the following types:
		//	1. twve.button,
		//	2. twve.editable, or
		//	3. twve.element.
		var menu = twve.node.create('div');
		// hasItem
		menu.findItem = function(label){
			if ( menu.items )
				for ( var i = 0; i < menu.items.length; i++ ) {
					var item = menu.items[i];
					if ( item.label == label ) return item;
				}
			return null;
		};
		// addItem
		menu.addItem = function(label,tooltip){
			// Adds one item label to this menu. Returns the item just
			// added.
			if ( ! menu.items ) menu.items = new Array();
			var item = twve.button.create(
				createTiddlyElement(menu.$dom[0],'li'),
				null,
				tooltip
			);
			item.$dom[0].style.whiteSpace = 'nowrap';
			item.label = label;
			twve.node.wikify(label,item.$dom);
			item.mouseenter = function(){
				if ( item.submenu ) {
					item.submenu.show(
						twve.node.offset(item.$dom),
						'left'
					);
				}
			};
			item.mouseleave = function(ev){
				var pos = twve.tiddler.mousePosition(ev);
				if ( item.submenu
					&& ! item.submenu.contains(pos) )
					item.submenu.hide();
			};
			menu.items.push(item);
			menu.$dom.attr('adjusted','');
			return item;
		};
		// addItems
		menu.addItems = function(items){
			// Adds an array of items to this menu. See menu.addItem
			// above for more information.
			for ( var i = 0; i < items.length; i++ )
				menu.addItem(items[i]);
			return menu;
		};
		// contains
		var preContains = menu.contains;
		menu.contains = function(pos){
			if ( preContains.apply(this,arguments) )
				return true;
			if ( menu.items )
				for (var i=menu.items.length-1; i>=0; i--)
					if ( menu.items[i].submenu
						&& menu.items[i].submenu.contains(pos) )
							return true;
			return false;
		};
		// hideRoot
		menu.hideRoot = function(){
			menu.root.hide();
			return menu;
		};
		// hide
		menu.hide = function(hideroot){
			if ( hideroot ) menu.hideRoot();
			menu.$dom.hide();
			return menu;
		};
		// adjustPos
		menu.adjustPos = function(menuobj,pos,where){
			var w = menuobj.width();
			pos.left += /right/i.test(where)
				? w : (-w);
			var h = menuobj.height();
			if ( /top/i.test(where) )
				pos.top -= h;
			else if (/bottom/i.test(where))
				pos.top += h;
			else
				pos.top++;
			return pos;
		};
		// showRoot
		menu.showRoot = function(pos,where){
			var menupos = twve.object.create();
			menupos.left = pos.left;
			menupos.top = pos.top;
			menu.adjustPos(menu.root,menupos,where);
			menu.root.show(menupos);
			return menupos;
		};
		// adjustDim
		menu.adjustDim = function(){
			if ( menu.items ) {
				var w = 0;
				var h = 0;
				for ( var i=0; i<menu.items.length; i++ ){
					var iw = menu.items[i].$dom.outerWidth(true);
					if ( iw > w ) w = iw;
					menu.items[i].$dom.css({
						top: h
					});
					h += menu.items[i].$dom.outerHeight(true);
				}
				menu.$dom.width(w);
				menu.$dom.height(h);
			}
			menu.$dom.attr('adjusted','true');
			return menu;
		};
		// show
		menu.show = function(pos,where){
			menu.$dom.show();
			if ( ! menu.$dom.attr('adjusted') ) {
				menu.adjustDim();
			}
			if ( pos ) {
				var w = menu.width();
				if ( w > pos.left ) menu.$dom.width((w=pos.left));
				var h = twve.node.cssSize(menu.$dom.css('font-size'))*20;
				if ( menu.$dom.height() > h ) menu.$dom.height(h);
				var menupos = twve.object.create();
				menupos.left = pos.left;
				menupos.top = pos.top;
				menu.adjustPos(menu,menupos,where);
				menu.$dom.css({
					left: menupos.left,
					top: menupos.top
				});
			}
			return menu;
		};
		// end of definitions
		// begin of initialization
		var $parent = twve.tiddler.getDisplay();
		if ( ! root.mouseenter ) {
			// root.mouseenter
			root.mouseenter = function(){
				var pos = twve.node.offset(jQuery(this));
				menu.show(pos,'left');
				return menu;
			};
			// root.click
			root.click = function(){
				menu.hide();
				return menu;
			};
			root.$dom.appendTo($parent);
		}
		menu.root = root;
		menu.$dom.appendTo($parent).css({
			overflow : 'auto',
			position : 'absolute'
		}).addClass(
			'popup'
		).hide();
		if ( autohide )
			menu.$dom.mouseleave(function(){
				jQuery(this).hide();
			});
		else
			menu.$dom.mouseleave(function(ev){
				if ( menu.mouseleave )
					menu.mouseleave.call(this,ev || window.event);
			});
		// end of creation
		return menu;
	}
};
//}}}
/***
!!! twve.editable
***/
//{{{
twve.editable = {
//}}}
/***
!!!! twve.editable.create
***/
//{{{
	create : function(src){
		var editable = twve.node.create();
		// clear
		//preClear = editable.clear;
		editable.clear = function(){
			//preClear.apply(this);
			// title of the direct wrapper
			editable.wrapper_title = '';
			// tiddler containing this element
			editable.tiddler = null;
			// jQuery object representing all the wrappers related to
			// this element, each of the wrappers contains one of the
			// copies of this element. See twve.wrapper for details of
			// the system wrappers.
			editable.$wrapper = null;
			// The starting and ending information of the element.
			editable.start = twve.position.create();
			editable.end = twve.position.create();
			return editable;
		};
		// copy from
		preCopyFrom = editable.copyFrom;
		editable.copyFrom = function(editablex){
			preCopyFrom.apply(this,arguments);
			editable.wrapper_title = editablex.wrapper_title;
			editable.tiddler = editablex.tiddler;
			editable.$wrapper = editablex.$wrapper;
			editable.start.copyFrom(editablex.start);
			editable.end.copyFrom(editablex.end);
			return editable;
		};
		// created
		editable.created = function(src){
			editable.clear();
			return src
				? src.$dom
					? editable.copyFrom(src)
					: editable.setElement(src)
				: editable;
		};
		// show
		editable.show = function(){
			editable.$dom.show();
			return editable;
		};
		// hide
		editable.hide = function(){
			editable.$dom.hide();
			return editable;
		};
		// isEditable
		editable.isEditable = function($elem){
			return editable.is($elem)
				|| jQuery.contains(editable.$dom[0],$elem[0]);
		};
		// clone
		editable.clone = function(){
			return twve.tiddler.cloneEditable(editable);
		};
		// multi line
		editable.multiLine = function (txt) {
			return /\n/.test(txt);
		};
		// twveSelector
		editable.twveSelector = function(which){
			return twve.tiddler.twveSelector(editable.$dom,null,which);
		};
		// is wrapper?
		editable.isWrapper = function(){
			return false;
		};
		// folded wrapper
		editable.foldedWrapper = function(){
			return ! editable.directWrapper().isVisible();
		};
		// direct wrapper
		editable.directWrapper = function(){
			// Find the direct wrapper of the editable from the
			// registered wrappers.
			// See twve.tiddler.registerWrapper() for a list of system
			// wrappers.
			return twve.tiddler.directWrapper(editable.$dom);
		};
//}}}
/***
!!!!! editable.setElement
***/
//{{{
		editable.setElement = function ($elem) {
			// Sets element $elem (jQuery object) to this twve.editable
			// object.
			// If $elem is already set before, this method returns null
			// (meaning no further process is needed). Otherwise it
			// returns this editable itself.

			if ( $elem.is(editable.$dom) ) return null;

			editable.$dom = $elem;
			// Find the wrapper title if not yet.
			if( ! editable.wrapper_title ) {
				editable.wrapper_title =
					editable.directWrapper().titleOfWrapper();
			}
			// Find tiddler and all copies of wrappers if not
			// a shadow tiddler
			if ( store.isShadowTiddler(editable.wrapper_title) ) {
				editable.tiddler = null;
				editable.$wrapper = null;
				editable.wrapper_title = null;
			} else {
				if ( ! editable.tiddler ) {
					editable.tiddler = twve.tiddler.get(
						editable.wrapper_title
					);
				}
				if ( ! editable.$wrapper ) {
					editable.$wrapper = twve.tiddler.wrapperFromTitle(
						editable.wrapper_title
					);
				}
			}
			return editable;
		};
//}}}
/***
!!!!! editable.changed
***/
//{{{
		editable.changed = function(param){
			// This is the event handler in twve.editable.
			// See http://twve.tiddlyspace.com/#%5B%5BEvent%20handler%20--%20element_changed%5D%5D
			// for more information.

			// This handler is called when an element is changed by the
			// user. Other plugins may override this one to perform
			// further operations, such as recalculating the table,
			// after changes made.

			// This handler returns the param.text, which contained the
			// updated text of the element.
			// If other plugins further change the content of the
			// element, they should put it back to param.text and
			// return it.
			return param.text;
		};
//}}}
/***
!!!!! editable.setText
***/
//{{{
		editable.setText = function (newtxt,open,close) {
			var text = editable.tiddler.text;
			var nl = '';
			var dlen = 0;
			if ( typeof open != 'number' ) open = editable.start.ndx;
			if ( typeof close != 'number' ) {
				close = editable.end.ndx;
				if (/\n/.test(editable.end.matched)) nl = '\n';
			}

			if ( ! newtxt ) {
				// The user wants to remove the existing text.
				if ( nl && close < text.length-1 ) {
					// Usually the editable.end.ndx stays on the ending
					// '\n' if there is one. We want to remove it as
					// well otherwise there will be an empty line left
					// behind.
					close++;
				}
				text = text.substring(0,open)+text.substring(close);
				// change in length of text
				dlen = close - open;
			} else {
				if ( open==0 && close==0 ) {
					text = newtxt + nl + text;
				} else {
					if (nl
						&& (open != close
							|| text.charAt(open)==nl
							|| /\n$/.test(newtxt))
					)
						// If there is '\n' in one of the above cases
						// then we don't want to add one more.
						nl = '';
					text = text.substring(0,open)
							+newtxt+nl
							+(close < text.length
								? text.substring(close)
								: '');
				}
				dlen = newtxt.length + (nl?1:0) - (close-open);
			}
			// update the ending index of the direct wrapper if
			// desired.
			var dw = editable.directWrapper();
			if ( dw != editable && dw.end.ndx >= editable.end.ndx ) {
				dw.end.ndx += dlen;
			}
			// update the ending index of this editable.
			editable.end.ndx += dlen;
			// update tiddler text
			twve.tiddler.saveText(editable,text);
			return editable;
		};
//}}}
/***
!!!!! editable.getText
***/
//{{{
		editable.getText = function (open,close) {
			if ( typeof open != 'number' ) open = editable.start.ndx;
			if ( typeof close != 'number' ) close = editable.end.ndx;
			return close > -1
				? editable.tiddler.text.substring(open,close)
				: editable.tiddler.text.substring(open);
		};
//}}}
/***
!!!!! editable.focusEditBox
***/
//{{{
		editable.focusEditBox = function(ta,txta){
			if ( txta ) ta[0].select();
			else ta[0].focus();
			twve.tiddler.initCaretPos();
			return editable;
		};
//}}}
/***
!!!!! editable.editText
***/
//{{{
		editable.editText = function(ev,txta,$elem) {
			// Parameters:
			//		ev: event object passed to mouseUp event.
			//			This is not necessary in this default
			//			"editText" method, but could be needed in
			//			other objects. For example, in twve.table
			//			this is used to determine the missing cells.
			//		txta: can be one of the followings:
			//			a. null or undefined
			//				the default "editText" method will call
			//				the "getText" method to retrieve the text
			//				of the element
			//			b. text to edit or to show in the editbox
			//			c. array of prepared <textarea>
			//				see the "editCell" method in the "create"
			//				method of twve.table object for an example
			//		$elem: can be one of the followings:
			//			a. null or undefined
			//				the default "editText" method will call
			//				the "getElement" method to retrieve the
			//				element to edit
			//			b. the element to edit
			//				see the "editCell" or "editCaption" methods
			//				in the "create" method of twve.table object
			//				for an example

			twve.tiddler.cur_twelem = editable;

			if ( ! $elem ) $elem = editable.getElement();
			var esize = $elem.size();
			var fs = twve.node.cssSize($elem.css('font-size'));
			var w = $elem.width();
			var talign = $elem.css('text-align');
			var fm = $elem.css('font-family');
			var minw = fs*config.options.txttwveMinEditWidth;
			var lh = twve.node.cssSize($elem.css('line-height'));
			if (w < minw) w = minw;

			if ( typeof txta == 'undefined' )
				txta = editable.getText();
			var ta;
			if ( typeof txta == 'string' ) {
				ta = [jQuery(document.createElement('textarea'))];
				ta[0].val(txta);
				ta[0][0].defaultValue = txta;
				ta[0].width(w);
			} else {
				ta = txta;
				txta = ta[0].val();
				if ( txta == '>' )
					txta = ta[0].eq(-1).val();
			}

			var $display = $elem.closest(
				twve.tiddler.displaySelector()
			);
			var $edit_box = jQuery([]);
			var eb = editable.box('edit');
			if ( eb.height < lh ) eb.height = lh;
			jQuery.each(ta, function(r, $rta){
				$edit_box = $edit_box.add($rta);
				if ( ta.length == 1 && ta[0].size() == 1 ) {
					$rta.appendTo($display).css({
						'position':'absolute'
						,'left':eb.left
						,'top':eb.top
						,'width':eb.width
					});
					$rta.height(0);
					var scrH = $rta.prop('scrollHeight');
					if ( scrH < eb.height ) scrH = eb.height;
					else eb.height = scrH;
					$rta.height(scrH);
					//$elem.attr('elemH',scrH);
					$rta.css({
						'height':eb.height
					});
				}
				$rta.css({
					'padding':'0'
					,'margin':'0'
					,'overflow':'auto'
					,'text-align':talign
					,'font-family':'monospace'
					,'font-size':fs
				}).attr({
					'scrH0':eb.height,
					'spellcheck':'true',
					'cancel':'false',
					'title':'('+(editable.multiLine(txta)
								?'Ctrl-'
								:'')+'ENTER=accept, ESC=cancel)'
				}).keydown (twve.tiddler.keydown)
				.bind('paste', twve.tiddler.paste)
				.bind('copy', function(){
					twve.tiddler.copyOrCut();
				}).bind('cut', function(){
					twve.tiddler.copyOrCut(true);
				});
			});
			twve.tiddler.setEditBox($edit_box);
			editable.focusEditBox(ta,txta,ev,$elem);

			var $preview = twve.tiddler.getPreviewer($display);
			var tpos = twve.node.offset(ta[0]);
			$preview.css({
				'left':tpos.left,
				'top':tpos.top,
				'width':ta[0].width() // outerWidth() would be over
			});
			// Copy font attributes
			twve.node.copyFontColor($preview,$elem);
			// Output to previewer
			setTimeout(function(){
				twve.tiddler.previewEditBox(ta[0],null,tpos);
			},0);

			return ta;
		};
//}}}
/***
!!!!! editable.hasClass
***/
//{{{
		editable.hasClass = function ( cstr ) {
			return editable.$dom.hasClass(cstr);
		};
//}}}
/***
!!!!! editable.saveText
***/
//{{{
		editable.saveText = function(newtext,newtitle){
			return twve.tiddler.saveText(editable,newtext,newtitle);
		};
//}}}
/***
!!!!! end of editable
***/
//{{{
		return editable.created(src);
	}
};
//}}}
/***
!!! twve.element
***/
//{{{
twve.element = {
//}}}
/***
!!!! twve.element.create
***/
//{{{
	create : function(elem) {
		var twelem = twve.editable.create();
		//var preClear = twelem.clear;
		twelem.clear = function(){
			//preClear.apply(this);
			// direct wrapper of the $dom
			twelem.direct_wrapper = null;
			// rendering index
			twelem.rIndex = -1;
			// defining index
			twelem.dIndex = -1;
			// opening and closing signatures
			twelem.tags = null;
			return twelem;
		};
		// copyFrom
		var preCopyFrom = twelem.copyFrom;
		twelem.copyFrom = function(elem){
			preCopyFrom.apply(this,arguments);
			twelem.direct_wrapper = elem.direct_wrapper;
			twelem.rIndex = elem.rIndex;
			twelem.dIndex = elem.dIndex;
			twelem.tags = elem.tags;
			return twelem;
		};
		// wiki tags
		twelem.wikiTags = function(){
			return twve.tiddler.wikiTags(twelem.$dom);
		};
		// wikify
		twelem.wikify = function(txt){
			return twve.node.wikify(txt,twelem.$dom);
		};
		// direct wrapper
		var preDirectWrapper = twelem.directWrapper;
		twelem.directWrapper = function () {
			// Find the direct wrapper of this element if not yet.
			if ( ! twelem.direct_wrapper )
				twelem.direct_wrapper = preDirectWrapper.apply(this);
			// Return the direct wrapper.
			return twelem.direct_wrapper;
		};
//}}}
/***
!!!!! twelem.renderedCopy
***/
//{{{
		twelem.renderedCopy = function($w) {
			// Find the rendered copy of this twelem in the
			// wrapper $w (jQuery object).

			if ( twelem.directWrapper().$dom[0] == $w[0] )
				// Searching in the direct wrapper, the rendered copy
				// is just this twve.element object.
				return twelem;

			// We are searching a transcluded copy of this twelem.
			// If both this twelem and that copy to be searched in $w
			// are neither partially transcluded (non-transcluded or
			// normally transcluded), their rendering index shall be
			// the same and there is no need to re-find it. If,
			// however, either one of the two copies is partially
			// transcluded, their rendering indexes are not the same
			// in general, we need to re-find it in $w.
			var rndx = -1;
			if ( twve.text.tiddlerSection(twelem.wrapper_title)
				||	twve.text.tiddlerSection(
						twve.tiddler.titleOfWrapper($w)
					)
				) {
				// One of the copies is partially transcluded.
				// Clear the rendering index (set to -1) so the
				// twve.wrapper.renderedElement() function will re-find
				// it (by setting twelem.rIndex to -1).
				rndx = twelem.rIndex;
				twelem.rIndex = -1;
			}
			var the_copy = twve.wrapper.renderedElement(twelem,$w);
			if ( rndx > -1 )
				// We had cleared the rendering index of this object
				// to re-find it in $w. Restore it here.
				twelem.rIndex = rndx;
			return the_copy;
		};
//}}}
/***
!!!!! twelem.removeSelf
***/
//{{{
		twelem.removeSelf = function(){
			twelem.$dom.remove();
			twve.tiddler.focusElem(null);
			return twelem;
		};
//}}}
/***
!!!!! twelem.refreshSelf
***/
//{{{
		twelem.refreshSelf = function(txt,$elem){
			// Refresh the element itself and the call the
			// twelem.changed() event handler if necessary.
			// This method is normally called within
			// twelem.refreshAll(), which takes care of
			// transclusion synchronization.

			// Parameters:
			//		txt:	See twelem.refreshAll above.
			//		$elem: can be one of the followings:
			//			a. null or undefined
			//				the default "refreshSelf" method will call
			//				the "getElement" method to retrieve the
			//				element to refresh
			//			b. the element to refresh
			//				see the "refreshSelf" method in the
			//				"create" of twve.table object for an
			//				example.
			twve.node.wikify(
				txt,
				$elem ? $elem : twelem.getElement()
			);
			return twelem;
		};
//}}}
/***
!!!!! twelem.refreshAll
***/
//{{{
		twelem.refreshAll = function(txt,param){
			// Refresh/Re-render the element, and synchronize all
			// transcluded copies.

			// Parameters:
			//		txt:	An array of text to refresh the element.
			//				Normally there is only one text in the
			//				array. Occasionally there are multiple
			//				text for elements such as spanned table
			//				cells.
			//		param:	(Optional) Parameter for twelem.changed
			//				event handler. This parameter, if given,
			//				should be an object containing
			//				{
			//					what: "event message",
			//					other info that you defined to go with
			//					the event message...
			//				}

			// The following two variables are for refreshing part or
			// whole of a folded wrapper.
			var $folded = null;
			var animated = config.options.chkAnimate;
			config.options.chkAnimate = false;
			var sec = twve.text.tiddlerSection(
				twelem.wrapper_title
			);
			if ( typeof txt != 'string' ) {
				txt = twelem.getText();
			}
			twelem.$wrapper.each(function(n,w){
				var $w = jQuery(w);
				var w_sec = twve.text.tiddlerSection(
					twve.tiddler.titleOfWrapper($w)
				);
				if ( sec && w_sec && w_sec != sec ) {
					// We are refreshing only one section in the
					// tiddler, but this wrapper contains another
					// section different from the one to refresh.
					// Do nothing.
					return;
				}
				var twcopy = twelem.renderedCopy($w);
				if ( twcopy ) {
					$folded = twcopy.foldedWrapper();
					if ( $folded ) {
						// unfold it to refresh the element
						twve.wrapper.unfold($folded);
					}
					if ( txt ) {
						// Refresh the element
						twcopy.refreshSelf(txt);
						if ( param && param.what ) {
							twcopy.changed(param);
						}
					} else
						// Text empty, usually means this element
						// should be removed.
						twcopy.removeSelf(param);
					// Done refreshing
					if ( $folded ) {
						// fold it back
						twve.wrapper.fold($folded);
					}
				}
			});
			config.options.chkAnimate = animated;
			return twelem;
		};
//}}}
/***
!!!!! twelem.renderingIndex
***/
//{{{
		twelem.renderingIndex = function(){
			// Find the rendering index of a twve.core element object
			// in its direct wrapper.
			if ( twelem.rIndex < 0 ) {
				var $elems = twve.wrapper.findElements(
					twelem.directWrapper().$dom,
					twelem.twveSelector()
				);
				if ( $elems )
					twelem.rIndex = $elems.index(twelem.$dom);
			}
			return twelem.rIndex;
		};
//}}}
/***
!!!!! twelem.counts
***/
//{{{
		twelem.counts = function(searchInfo){
			// Check if the currently found element counts as a valid
			// one. If so,
			//		1.	update the ndx and remained properties of
			//			searchInfo,
			//		2.	set to the nextNdx property the position to go
			//			for next search,
			//		3.	return true.
			// Otherwise,
			//		1.	set to the nextNdx property the position to go
			//			for next search,
			//		2.	return false.
			// See the counts method in twve.table or twve.blockquote
			// for examples.
			searchInfo.remained--;
			searchInfo.ndx++;
			searchInfo.nextNdx =
				twelem.start.ndx + twelem.start.matched.length;
			return true;
		};
//}}}
/***
!!!!! twelem.starts
***/
//{{{
		twelem.starts = function (start,txt) {
			// Find the starting position of an element represented
			// by this twve.element object, starting from the argument
			// start, if given, or the beginning of the direct wrapper.
			// The argument start, if given, shall be an object of
			// twve.position.
			// Returns a twve.position object that contains the
			// position of the first char of the opening tag and the
			// matched opening tag.

			if ( !(txt || twelem.tiddler) ||
				!twelem.tags || !twelem.tags.open ) {
				twelem.start.ndx = -1;
				return twelem.start;
			}
			if (! txt) txt = twelem.tiddler.text;

			// Ensure the validity of twelem.start.ndx
			twelem.start.ensureValid(
				start || twelem.directWrapper().start
			);
			var searchInfo = twve.object.create();
			// Remaining number of elements to skip before identifying
			// this one (twelem.$dom).
			searchInfo.remained = twelem.dIndex > -1
				? (twelem.dIndex+1)
				: (twelem.rIndex > -1 ? (twelem.rIndex+1) : 1);
			// Index number (order of appearance) of the element
			// represented by this twve.element object.
			// If the rendering index (twelem.rIndex) was -1 upon
			// calling this function, its value would be set to
			// count.ndx upon returning. Same thing would be done to
			// the defining index (twelem.dIndex) if it was -1 upon
			// calling.
			searchInfo.ndx = -1;
			// Do the searching
			do {
				if ( txt.charAt(twelem.start.ndx) != '\n'
					&& /^[\n]/.test(twelem.tags.open) ) {
					// If the opening tag starts with a new line,
					// but there is no new line at the position
					// to start searching, we need to take spacial
					// care about it.
					if ( twelem.start.ndx == 0 ) {
						// If we are searching from the very beginning
						// of the tiddler, then we temporarily add a
						// new line to the beginning of txt.
						twelem.start = twelem.tags.nextOpenTag(
							'\n'+txt,twelem.start,true
						);
						// And shift it back if found.
						if ( twelem.start.ndx > 0 )
							twelem.start.ndx--;
					} else {
						// Otherwise we simply shift back by one
						// character.
						twelem.start.ndx--;
						twelem.start = twelem.tags.nextOpenTag(
							txt,twelem.start,true
						);
					}
				} else {
					// No need to take care of the new-line issue.
					// Just go.
					twelem.start = twelem.tags.nextOpenTag(
						txt,twelem.start,true
					);
				}

				if ( twelem.start.ndx == -1 ) {
					// Opening tag not found, returns the negative of
					// the remaining number of elements to be skipped.
					twelem.start.ndx = -searchInfo.remained;
					return twelem.start;
				}
				// Make sure this element is not an inactive element,
				// such as within a preformatted or a code block.
				var pre_end = twve.text.inactive(txt,twelem.start);
				if ( pre_end ) {
					twelem.start.ndx =
						pre_end.ndx + pre_end.matched.length;
					continue;
				}
				// Check if this one counts. 
				searchInfo.nextNdx = twelem.start.ndx;
				if ( ! twelem.counts(searchInfo,txt) ) {
					twelem.start.ndx = searchInfo.nextNdx;
					continue;
				}

				if ( searchInfo.remained == 0 ) {
					// Found the wiki text of the element.
					if ( twelem.dIndex == -1 )
						twelem.dIndex = searchInfo.ndx;
					if ( twelem.rIndex == -1 )
						twelem.rIndex = searchInfo.ndx;
					return twelem.start;
				}
				// Otherwise keep searching.
				twelem.start.ndx = searchInfo.nextNdx;
				if ( twelem.skipToCloseTag )
					twelem.skipToCloseTag(txt);
			} while (true);
		};
//}}}
/***
!!!!! twelem.nextCloseTag
***/
//{{{
		twelem.nextCloseTag = function(txt,start,tags){
			var end = twve.position.create(start);
			end = twve.text.indexOf(txt,tags.close,end);
			if ( end.ndx >= 0 ) {
				end.ndx += tags.close.length;
				return twelem.end.copyFrom(
					tags.closeTagEnds(txt,end)
				);
			} else {
				tags.lastCloseTag(txt,end);
				return twelem.end.copyFrom(
					twve.text.exhausted(txt,end,1)
				);
			}
		};
//}}}
/***
!!!!! twelem.matchedCloseTag
***/
//{{{
		twelem.matchedCloseTag = function(txt,start,tags){
			// Before calling this method,
			//	1.	the start.ndx MUST be right at the starting
			//		position of this element;
			//	2.	the tags.close MUST be just one string: the actual
			//		expected closing tag.
			//		(See tags.exactCloseTag() in twve.tags.)

			// This method MUST set the twelem.end.ndx to the ending
			// index of the defining text, and return twelem.end.
			return twelem.end.copyFrom(
				tags.matchedCloseTag(txt,start)
			);
		};
//}}}
/***
!!!!! twelem.ends
***/
//{{{
		twelem.ends = function (start,txt) {
			// Find the ending index of this element, starting from
			// start. If start is not given or a negative number, the
			// search starts from the beginning of this element.

			// Returns the index of the last char of the closing tag
			// if one is found, or a negative number to indicate the
			// number of enclosed elements remained to be searched
			// otherwise.

			if ( ! start || start == twelem.start ) {
				start = twve.position.create(twelem.start);
			} else if ( typeof start == 'number' ) {
				start = twve.position.create(start);
			} else {
				start.ensureValid();
			}
			if (! txt) txt = twelem.tiddler.text;
			var tags = twelem.tags.exactCloseTag(start);

			// For opening tags not starting with '\n', the current
			// starting position may be right at the beginning of the
			// currently found opening tag. If so we need to forward
			// the starting position because the next function will
			// look for next opening tag from start.ndx.
			if ( /^[^\n]/.test(start.matched)
				&& txt.substring(
					start.ndx,start.ndx+start.matched.length
				)==start.matched ) {
				start.ndx += start.matched.length;
			}

			// For elements having the same opening and closing tags,
			// we only need to look for the closing tag ONCE. Otherwise
			// go through a complicated loop to correctly locate the end.
			return tags.identicalPair()
				?	twelem.nextCloseTag(txt,start,tags)
				:	twelem.matchedCloseTag(txt,start,tags);
		};
//}}}
/***
!!!!! twelem.setElement
***/
//{{{
		var preSetElement = twelem.setElement;
		twelem.setElement = function ($elem) {
			// Sets element $elem (jQuery object) to this twve.element
			// object.
			if ( ! $elem ) return twelem.clear();
			if ( typeof $elem == 'string' ) {
				twelem.$dom = $elem;
				twelem.tags = twve.tiddler.wikiTags($elem);
			} else {
				if ( ! preSetElement.apply(this,arguments) )
					// Same element, no need to do anything.
					return twelem;
				if ( ! twelem.tiddler )
					// Shadowed or non-existing tiddler
					return twelem;

				//if (!$elem.is('ol.popup')){
					// An element. Look for its rendering index
					// if necessary.
					if ( twelem.rIndex < 0 && twelem.dIndex < 0 )
						twelem.renderingIndex();
					// Find its corresponding wiki tags if necessary.
					if ( ! twelem.tags )
						// Find its corresponding wiki tags.
						twelem.tags = twelem.wikiTags();
					// Search for the beginning of element wiki text.
					twelem.starts();
					if ( twelem.start.ndx<0 && twelem.htmlTags ) {
						// If not found, search for HTML text
						twelem.tags = twelem.htmlTags(true);
						twelem.starts();
					}
					if ( twelem.start.ndx >= 0 ) {
						// If the beginning is found, search for
						// the end.
						twelem.ends();
					} else {
						// Otherwise set the end position to -1.
						twelem.end.ndx = -1;
					}
				//}
			}
			return twelem;
		};
//}}}
/***
!!!!! twelem.updateText
***/
//{{{
		twelem.updateText = function(txt){
			// Sets the modified text back to this element.

			// NOTE: the argument txt is ALWAYS an array of strings.
			// This is designed for table cells that span over multiple
			// rows/columns. For a column-spanned cell, txt is a single
			// array of strings. For a row-spanned cell, txt is a
			// double array of strings. For other elements, txt is an
			// array of one string (so the modified text would be
			// txt[0]).

			twelem.setText(txt[0]);
			return twelem.refreshAll(txt[0]);
		};
//}}}
/***
!!!!! End of twelem
***/
//{{{
		return twelem.created(elem);
	}
};
//}}}
/***
!!! twve.leveledElement
***/
//{{{
twve.leveledElement = {
//}}}
/***
!!!! twve.leveledElement.getLevel
***/
//{{{
	getLevel : function(txt,start){
		var ch = txt.charAt(start);
		var level = 0;
		if ( ch ) {
			level = 1;
			while ( txt.charAt(start+level) == ch ) level++;
		}
		return level;
	},
//}}}
/***
!!!! twve.leveledElement.create
***/
//{{{
	create : function(src){
		var elem = twve.element.create();
		// clear
		//var preClear = elem.clear;
		elem.clear = function(){
			//preClear.apply(this);
			elem.level = 0;
			return elem;
		};
		// copyFrom
		var preCopyFrom = elem.copyFrom;
		elem.copyFrom = function(src){
			preCopyFrom.apply(this,arguments);
			elem.level = src.level;
			return elem;
		};
//}}}
/***
!!!!! elem.getLevel
***/
//{{{
		elem.getLevel = function(txt,start) {
			if ( elem.level < 1 ) {
				if ( ! txt ) txt = elem.tiddler.text;
				if ( ! start ) start = elem.start;
				elem.level = twve.leveledElement.getLevel(
					txt, start.ndx
				);
			}
			return elem.level;
		};
//}}}
/***
!!!!! elem.sameLevel
***/
//{{{
		elem.sameLevel = function(newtxt){
			// Test if the level in newtxt the same as this elem.

			// For leveled elements, such as
			//		headings,
			//		list items,
			//		blockquotes,
			// the level can be changed by the user. When this happens,
			// twve does not refresh the element itself but its direct
			// wrapper, letting the TiddlyWiki do the hard work to
			// correctly re-generate the changed element.

			// Note:	This function MUST be called BEFORE setting the
			//			modified text back to the element.

			return elem.getLevel() ==
				twve.leveledElement.getLevel(newtxt,0);
		};
//}}}
/***
!!!!! elem.getOpenTag
***/
//{{{
		elem.getOpenTag = function(start,txt) {
			// Get the actually opening tag
			if ( ! txt ) txt = elem.tiddler ? elem.tiddler.text : '';
			if ( ! txt ) return '';
			if ( ! start ) start = elem.start;
			return (/^[\n]/.test(start.matched) ? '\n' : '') +
				txt.substring(
					start.ndx,
					(start.ndx+elem.getLevel(txt,start))
				);
		};
//}}}
/***
!!!!! elem.starts
***/
//{{{
		var preStarts = elem.starts;
		elem.starts = function(start,txt){
			preStarts.apply(this,arguments);
			elem.level = -1;
			elem.start.matched = elem.getOpenTag(start,txt);
			return elem.start;
		};
//}}}
/***
!!!!! elem.updateText
***/
//{{{
		elem.updateText = function(txt){
			var newtxt = txt[0];
			// BEFORE setting the modified text, check if
			//	1.	element level changed, or
			//	2.	newtxt contains '\n'.
			var changed = /\n/.test(newtxt) || ! elem.sameLevel(newtxt);
			// Set the new text
			elem.setText(newtxt);
			// Refresh
			return changed
				? elem.directWrapper().refreshAll()
				: elem.refreshAll(newtxt);
		};
//}}}
/***
!!!!! End of leveledElement
***/
//{{{
		return elem.created(src);
	}
};
//}}}
/***
!!! twve.heading
***/
//{{{
twve.heading = {
//}}}
/***
!!!! twve.heading.twveSelector
***/
//{{{
	enableEdit : true,
	getSelector : function(){
		return 'h1,h2,h3,h4,h5,h6';
	},
	getSpanSelector : function(selector){
		return 'span.TiddlyLinkExisting';
	},
	twveSelector : function(selector,which){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector(
			/^fold/i.test(which)
				? ('h1.foldable,h2.foldable,h3.foldable' +
					',h4.foldable,h5.foldable,h6.foldable')
				: (twve.heading.getSelector() +
					(/^head/i.test(which)
						? ''
						: ','+twve.heading.getSpanSelector()))
		);
		return selector;
	},
//}}}
/***
!!!! twve.heading.wikiTags
***/
//{{{
	wikiTags : function(){
		return twve.tags.create(
			'\n!',
			'\n'
		);
	},
//}}}
/***
!!!! twve.heading.getTitle
***/
//{{{
	getTitle : function(h,title_only){
		// Returns the title (content) of a header.

		var $h = null;
		if ( h.$dom ) {
			// h is a twve.heading object
			$h = h.$dom;
		} else if ( h.jquery ) {
			// h is a jQuery object
			$h = h;
			h = null;
		} else {
			// h must be a DOM object
			$h = jQuery(h);
			h = null;
		}

		if ( $h.children().size() > 0 ){
			// If a header contains formatted text or even transcluded
			// content, the rendered text will be different from the
			// defining wiki text and cause this plugin a failure in
			// finding the section content. In such cases we return
			// directly the defining wiki text instead of the rendered
			// text.
			var twh = twve.heading.create($h,h);
			return twve.text.sectionTitle(twh.getText());
		} else {
			var title = $h.text();
			var head = '';

			if ( config.macros.foldHeadings ) {
				head = config.macros.foldHeadings.hidelabel;
				if ( title.indexOf(head) == -1 ) {
					head = config.macros.foldHeadings.showlabel;
					if ( title.indexOf(head) == -1 )
						head = '';
				}
			}

			title = (head
				? title.substring(head.length).trim()
				: title);

			if ( ! title_only ) {
				// Look for multiple occurrences of the same title
				var twh = twve.heading.create($h,h);
				var $hs = twve.wrapper.findElements(
					twh.directWrapper().$dom,
					twve.heading.twveSelector()
				);
				if ( $hs ) {
					var hndx = $hs.index($h);
					var hoccur = 0;
					for ( var n = 0; n < hndx; n++ ) {
						var $hprev = $hs.eq(n);
						var tprev = twve.heading.getTitle($hprev,true);
						if ( tprev == title ) hoccur++;
					}
					if ( hoccur > 0 ) {
						title += ('?'+hoccur);
					}
				}
			}
			return title;
		}
	},
//}}}
/***
!!!! twve.heading.click
***/
//{{{
	preClick : null,
	click : function () {
		if ( ! twve.tiddler.getEditBox() ) {
			twve.heading.preClick.apply(this,arguments);
		}
	},
//}}}
/***
!!!! twve.heading.prepareElement
***/
//{{{
	prepareElements : function(twwrap){
		if ( config.options.chktwveCoreEnabled ) {
			twwrap.$dom.find(
				twve.heading.twveSelector(null,'foldable').include
			).each(function(n,h){
				if ( ! twve.heading.preClick )
					twve.heading.preClick = h.onclick;
				h.onclick = twve.heading.click;
			});
			return twwrap;
		}
		return null;
	},
//}}}
/***
!!!! twve.heading.create
***/
//{{{
	create : function(src,src2){
		// Create an instance of twve.heading object.
		if ( src2 && src2.$dom ) {
			// If src2 is a twve.heading object, src MUST be a
			// jQeury object.
			if ( src2.$dom.is(src) ) return src2;
			if ( jQuery.contains(
				src2.directWrapper().$dom[0],src[0]
			) ) {
				// src is in the same wrapper as src2.$dom
				var twh = twve.heading.create(src2);
				twh.rIndex = twh.dIndex = -1;
				twh.setElement(src);
				return twh;
			}
		}
		// Ignoring src2. In such cases src can be one of the
		// followings:
		//		1. a twve.heading object
		//		2. a jQeury object representing a header
		//		3. a DOM object (a header)
		var h = twve.leveledElement.create();
		// twveSelector
		h.twveSelector = function(selector){
			return twve.heading.twveSelector(selector,'heading');
		};
		// wikiTags
		h.wikiTags = function(){
			return twve.heading.wikiTags();
		};
		// get title
		h.getTitle = function (title_only) {
			return twve.heading.getTitle(h,title_only);
		};
		// set element
		var preSetElement = h.setElement;
		h.setElement = function($elem){
			return preSetElement.call(
				this,
				$elem.is('span') ? $elem.parent() : $elem
			);
		};
		// update text
		var preUpdateText = h.updateText;
		h.updateText = function(txt){
			if ( h.$dom.is('.foldable') ) {
				h.setText(txt[0]);
				h.directWrapper().refreshAll();
			} else
				preUpdateText.apply(this,arguments);
			return true;
		};
		// mouseenter
		h.mouseenter = function(ev){
			var selector = twve.heading.getSpanSelector();
			var $sp = h.$dom.find(selector);
			return $sp.size() == 0
				?	true
				:	jQuery(ev.target).is(selector);
		};
		// mousemove
		h.mousemove = function(ev){
			if ( ! h.mouseenter(ev) ) {
				twve.tiddler.focus();
			}
		};
		// isEditable
		h.isEditable = function($elem){
			var selector = twve.heading.getSpanSelector();
			return $elem.is(selector)
				? true
				: h.$dom.find(selector).size() == 0;
		};

		return h.created(src);
	}
};
//}}}
/***
!!! twve.pre
***/
//{{{
twve.pre = {
//}}}
/***
!!!! twve.pre.twveSelector
***/
//{{{
	enableEdit : true,
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('pre');
		return selector;
	},
//}}}
/***
!!!! twve.pre.wikiTags
***/
//{{{
	wikiTags : function(){
		return twve.tags.create(
			['\n{{{', '\n\/\/{{{', '\n\/\*{{{\*\/', '\n<!--{{{-->'],
			['}}}\n', '\/\/}}}\n', '\/\*}}}*\/\n', '<!--}}}-->\n']
		);
	},
//}}}
/***
!!!! twve.pre.create
***/
//{{{
	create : function(src){
		var pre = twve.element.create(src);
		// wikiTags
		pre.wikiTags = function(){
			return twve.pre.wikiTags();
		};
		// skipOpening
		/*
		pre.skipOpening = function ( txt ) {
			var plen = 3, ch = txt.charAt(0);
			switch ( ch ) {
				case '{' :
				default :
					return 3;
				case '/' :
					while ( txt.charAt(plen) != '{' ) plen++;
					while ( txt.charAt(plen) == '{' ) plen++;
					if ( txt.charAt(1) == '*' )
						while ( txt.charAt(plen) != '/' ) plen++;
					return plen+1;
				case '<' :
					while ( txt.charAt(plen) != '{' ) plen++;
					while ( txt.charAt(plen) == '{' ) plen++;
					while ( txt.charAt(plen) != '>' ) plen++;
					return plen+1;
			}
		};
		*/
		// skipClosing
		/*
		pre.skipClosing = function ( txt ) {
			var plen = txt.length-3, ch = txt.charAt(0);
			switch ( ch ) {
				case '{' :
				default :
					return plen;
				case '/' :
					while ( txt.charAt(plen) != '}' ) plen--;
					while ( txt.charAt(plen) == '}' ) plen--;
					while ( txt.charAt(plen) != '/' ) plen--;
					return txt.charAt(plen-1) == '/' ? plen-1 : plen;
				case '<' :
					while ( txt.charAt(plen) != '}' ) plen--;
					while ( txt.charAt(plen) == '}' ) plen--;
					while ( txt.charAt(plen) != '<' ) plen--;
					return plen;
			}
		};
		*/
		// updateText
		pre.updateText = function (txt) {
			var newtxt = txt[0];
			pre.setText(newtxt);
			if ( pre.$dom.is('table') ) {
				pre.directWrapper().refreshAll();
			} else {
				pre.refreshAll(newtxt);
			}
			return true;
		};
		// refreshSelf
		pre.refreshSelf = function(newtxt){
			pre.$dom.text(
				newtxt.substring(
					//pre.skipOpening(newtxt),
					//pre.skipClosing(newtxt)
					pre.start.matched.length,
					newtxt.length-pre.end.matched.length
				)
			);
			return pre;
		};
		return pre;
	}
};
//}}}
/***
!!! twve.code
***/
//{{{
twve.code = {
//}}}
/***
!!!! twve.code.twveSelector
***/
//{{{
	enableEdit : true,
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('code');
		selector.excludeSelector('.syntaxhighlighter code');
		return selector;
	},
//}}}
/***
!!!! twve.code.wikiTags
***/
//{{{
	wikiTags : function(){
		return twve.tags.create(
			'{{{',
			'}}}'
		);
	},
//}}}
/***
!!!! twve.code.create
***/
//{{{
	create : function(src){
		var code = twve.element.create(src);
		// wikiTags
		code.wikiTags = function(){
			return twve.code.wikiTags();
		};
		return code;
	}
};
//}}}
/***
!!! twve.wrapper
***/
//{{{
twve.wrapper = {
//}}}
/***
!!!! twve.wrapper.recordFoldable
***/
//{{{
	recordFoldable : function($foldable){
		var folded = null;
		if ( $foldable ) {
			folded = new Array();
			for ( var i = 0; i < $foldable.size(); i++ ) {
				folded[i] = $foldable[i].style.display=='none';
			}
		}
		return folded;
	},
//}}}
/***
!!!! twve.wrapper.restoreFoldable
***/
//{{{
	restoreFoldable : function($foldable,folded){
		if ( folded && $foldable ) {
			// Temporarily disable animation
			var animated = config.options.chkAnimate;
			config.options.chkAnimate = false;
			var imax = Math.min(folded.length, $foldable.size());
			for ( var i = 0; i < imax; i++ ) {
				if ( $foldable[i]
					&& ( (folded[i]&&$foldable[i].style.display!='none')
						|| (!folded[i]
							&&$foldable[i].style.display=='none') ) ) {
					$foldable[i].previousSibling.onclick();
				}
			}
			config.options.chkAnimate = animated;
		}
	},
//}}}
/***
!!!! twve.wrapper.renderedElement
<<<
* This function finds a rendered copy of twelem in wrapper $w.
** The wrapper can be one of the system wrappers:
*** div.viewer,	 		normally loaded
*** div.tabContents,	{{{<<tabs>>}}} transcluded
*** span[tiddler],		{{{<<tiddler>>}}} transcluded
*** div.sliderPanel,	{{{<<slider>>}}} transcluded
*** span.sliderPanel,	{{{<<foldHeadings>>}}} folded
* If none of the indexes (rendering and defining) are given, this function returns null.
* If the defining index is given but the rendering index not (initialized to -1), this function goes through the tiddler text to find its rendering index (matching the defining index), then finds the rendered copy and returns it. This happens during transclusion synchronization when all transcluded copies are to be updated after one of them is changed.
* If the rendering index is given, this function simply finds the rendered element with that rendering index, in a cyclic manner if the 3rd argument cyclic is true, and returns it, regardless of the status of defining index. This happens during keyboard navigation where one definitely knows the rendering index of the current element and wants to move to the next.
<<<
***/
//{{{
	renderedElement : function (twelem,$w,cyclic) {
		//	Arguments:
		//		twelem:	A twve.element object representing the element
		//				to look for.
		//		$w:	The wrapper in which to find the element. If
		//			omitted, the search will be done within
		//			twelem.directWrapper().
		//		cyclic: Search in a cyclic manner.
		if ( ! twelem ) return null;
		if ( twelem.rIndex < 0 && twelem.dIndex < 0 && ! cyclic ) {
			return null;
		}

		if ( ! $w ) $w = twelem.directWrapper().$dom;
		// Make sure there are such kind of elements in the wrapper.
		var $elements = twve.wrapper.findElements(
			$w, twelem.twveSelector()
		);
		// If no such elements contained in the wrapper, return null.
		if ( ! $elements ) return null;

		var size = $elements.size();
		// Make a copy of the element
		var newelem = twelem.clone();

		if ( cyclic ) {
			// Find the element in a cyclic manner.
			if ( newelem.rIndex < 0 )
				newelem.rIndex = size-1;
			else if ( newelem.rIndex >= size )
				newelem.rIndex = 0;
		} else {
			// Not in a cyclic manner.
			if ( newelem.rIndex < 0 ) {
				// Rendering index unknown. Find it from the tiddler
				// text.
				newelem.$wrapper = $w;
				newelem.direct_wrapper =
					twve.tiddler.createEditableWrapper($w);
				newelem.wrapper_title =
					newelem.directWrapper().titleOfWrapper();

				// Find the element. The rendering index will be
				// determined in newelem.starts() function.
				newelem.starts();
				if ( newelem.rIndex >= 0 ) {
					newelem.ends();
					newelem.$dom = $elements.eq(newelem.rIndex);
					return newelem;
				}
				return null;
			} else if ( newelem.rIndex >= size ) {
				// This wrapper does not contain a rendered copy of
				// twelem.
				return null;
			}
		}

		var $elem = $elements.eq(newelem.rIndex);
		if ( newelem.dIndex < 0 ) {
			newelem.setElement($elem);
		} else {
			newelem.$dom = $elem;
		}
		return newelem;
	},
//}}}
/***
!!!! twve.wrapper.findElements
***/
//{{{
	findElements : function ($w, selector) {
		// Find all the rendered elements in wrapper $w that are
		// specified by selector. The 2nd argument can be either
		// a string (valid CSS selector), or an object containing
		// the following information:
		//	{
		//		include: CSS selector to include
		//		exclude: CSS selector to exclude
		//	}

		if ( ! $w || ! selector ) return null;

		if (typeof selector == 'string' ) {
			selector = twve.selector.create(selector,'');
		} else if ( ! selector.include ) {
			// The 2nd argument is not a valid selector object.
			return null;
		}

		var $elems = $w.find(selector.include);

		// In wrapper $w there could be transcluded tiddlers,
		// which may contain elements of the same type. We shall
		// remove them because they are not defined in the tiddler
		// directly related to wrapper $w.

		var t_selector = twve.selector.create();
		twve.tabContent.twveSelector(t_selector);
		twve.sliderPanel.twveSelector(t_selector);
		twve.tiddlerSpan.twveSelector(t_selector);
		var $t_wrapper = $w.find(t_selector.include);
		if ( $t_wrapper.size() > 0 ) {
			$elems = $elems.not(
				$t_wrapper.find(selector.include)
			);
		}

		if ( selector.exclude )
			$elems = $elems.not(selector.exclude);

		return $elems.size() > 0 ? $elems : null;
	},
//}}}
/***
!!!! twve.wrapper.unfold
***/
//{{{
	unfold : function($w){
		// Unfold a wrapper to show its content. In TiddlyWiki
		// contents transcluded with <<slider>> macro can be hidden
		// (folded) from the user some times. When they are, the
		// elements showing the content can have zero heights, causing
		// a messed up output in refreshing. It is necessary to
		// unfold these wrappers beforehand, and fold it back
		// afterwards, to produce the correct results.
		if($w[0]) $w[0].style.display = 'block';
	},
//}}}
/***
!!!! twve.wrapper.fold
***/
//{{{
	fold : function($w,animated){
		if($w[0]) $w[0].style.display='none';
		if ( animated !== undefined ) {
			config.options.chkAnimate = animated;
		}
	},
//}}}
/***
!!!! twve.wrapper.refreshAll
***/
//{{{
	refreshAll : function(twwrap,sec){
		// Refresh the wrapper twwrap,
		// and synchronize all transcluded copies.

		// The following two variables are for refreshing
		// part or whole of a folded wrapper.
		var animated = config.options.chkAnimate;
		config.options.chkAnimate = false;
		// Extract the section title if any
		if ( ! sec ) sec = twve.text.tiddlerSection(
			twwrap.wrapper_title
		);
		// Record the window positions.
		var $win = jQuery(window);
		var scrL = $win.scrollLeft();
		var scrT = $win.scrollTop();
		// Loop through all copies of this wrapper
		twwrap.$wrapper.each(function(n,w){
			var $w = jQuery(w);
			if ( $w.is(twwrap.$dom) ) {
				// Refresh if it's this very one
				twwrap.refreshSelf(sec);
			} else {
				// Otherwise find the editable copy
				var twcopy = twve.tiddler.createEditableWrapper($w);
				if ( ! twcopy ) return;
				// Extract its section title
				var w_sec = twve.text.tiddlerSection(
					twcopy.wrapper_title
				);
				// Do the refreshing if
				//	1.	We are refreshing whole tiddler, or
				//	2.	this wrapper contains the whole tiddler, or
				//	3.	we are refreshing one section and $w contains
				//		exactly that section.
				if ( ! sec || ! w_sec || w_sec == sec ) {
					// Exclude the situation where $w contains this one,
					// or vice versa.
					if(!(jQuery.contains($w[0],twwrap.$dom[0])
						|| jQuery.contains(twwrap.$dom[0],$w[0]))){
						// unfold it if necessary
						var $folded = w.style.display == 'none'
							? $w : null;
						if ( $folded )
							twve.wrapper.unfold($folded);
						// refresh the wrapper
						twcopy.refreshSelf(w_sec);
						// fold it back if necessary
						if ( $folded )
							twve.wrapper.fold($folded);
					}
				}
			}
		});
		$win.scrollLeft(scrL).scrollTop(scrT);
		config.options.chkAnimate = animated;
		return twwrap;
	},
//}}}
/***
!!!! twve.wrapper.refreshSelf
***/
//{{{
	refreshSelf : function(twwrap,sec){
		// Refresh only one wrapper, assuming open and visible.
		// If sec is null or undefined, this method refreshes
		// the whole wrapper. If sec is given, it should be the
		// section title associated with this wrapper, and
		// this method refreshes that section only.
		// Record the status of folded wrappers
		// if suitable.

		// Even though this wrapper is open and visible, there might be
		// foldable wrappers (created using <<slider>> or
		// <<foldHeadings>>) contained in this one. If so, we record
		// their folding status, refresh this wrapper, then restore their
		// folding status.

		// Record folding status, if there are foldable wrappers.
		var selector = twve.tiddler.twveFoldableSelector();
		var $foldable = twve.wrapper.findElements(
			twwrap.$dom, selector
		);
		var folded = twve.wrapper.recordFoldable($foldable);
		// Refresh this wrapper
		twwrap.$dom.empty();
		wikify(
			sec ? twwrap.getText('refresh') : twwrap.tiddler.text,
			twwrap.$dom[0]
		);
		// Restore folding status for foldable wrappers
		$foldable = twve.wrapper.findElements(
			twwrap.$dom, selector
		);
		//twve.wrapper.restoreFoldable($foldable,folded);
		// Prepare elements if defined.
		return twwrap.checkAndPrepare($foldable,folded);
	},
//}}}
/***
!!!! twve.wrapper.create
***/
//{{{
	create : function(wrap){
		var twwrap = twve.editable.create();
		// is wrapper?
		twwrap.isWrapper = function(){
			return true;
		};
		// direct wrapper
		twwrap.directWrapper = function(){
			return twwrap;
		};
		// title of wrapper
		twwrap.titleOfWrapper = function(){
			return twve.tiddler.titleOfWrapper(twwrap.$dom);
		};
		// starts
		twwrap.starts = function(sec,start){
			twwrap.start.ensureValid(start);
			if ( ! sec )
				sec = twve.text.tiddlerSection(twwrap.wrapper_title);
			if ( ! sec ) return twwrap.start;

			// Remove the info that is only used internally.
			var to_skip = twve.text.headerToSkip(sec);
			if ( to_skip > 0 ) {
				sec = twve.text.removeHeaderTail(sec);
			}
			var twh = twve.heading.create();
			twh.dIndex = 0;
			twh.tiddler = twwrap.tiddler;
			twh.end.ndx = twwrap.start.ndx;
			twh.tags = twve.heading.wikiTags();
			var title;
			while ( to_skip >= 0 ) {
				twh.starts(twh.end);
				if ( twh.start.ndx > -1 ) {
					twh.ends();
					if ( twh.end.ndx == -1 ) {
						twwrap.start.ndx = -1;
						return twwrap.start;
					}
					title = twh.tiddler.text.substring(
						twh.start.ndx, twh.end.ndx
					);
					title = twve.text.sectionTitle(title);
					if ( title.substring(0,sec.length)==sec ) {
						to_skip--;
					}
					//twh.section.start.ndx = twh.end.ndx;
				} else {
					twwrap.start.ndx = -1;
					return twwrap.start;
				}
			}
			twwrap.start.ndx = twh.end.ndx + 1;
			return twwrap.start;
		};
		// ends
		twwrap.ends = function(){
			var sec = twve.text.tiddlerSection(twwrap.wrapper_title);
			if ( sec ) {
				var twh = twve.heading.create();
				twh.dIndex = 0;
				twh.tiddler = twwrap.tiddler;
				twh.tags = twve.heading.wikiTags();
				twh.start.ndx = twwrap.start.ndx;
				twh.starts(twh.start);
				if ( twh.start.ndx < 0 )
					twwrap.end.ndx = twwrap.tiddler.text.length;
				else twwrap.end.ndx = twh.start.ndx - 1;
			} else
				twwrap.end.ndx = twwrap.tiddler.text.length;
			return twwrap.end;
		};
		// set element
		var preSetElement = twwrap.setElement;
		twwrap.setElement = function ($elem) {
			// Sets element $elem (jQuery object) to this twve.wrapper
			// object.
			if ( ! $elem ) return twwrap.clear();
			if ( ! preSetElement.apply(this,arguments) )
				// Same element, no need to do anything.
				return twwrap;
			if ( ! twwrap.tiddler )
				// Shadowed or non-existing tiddler
				return twwrap;
			twwrap.starts();
			twwrap.ends();
			return twwrap;
		};
		// update text
		twwrap.updateText = function(txt){
			twwrap.setText(txt[0]);
			twve.wrapper.refreshAll(twwrap);
			return true;
		};
		// refresh all copies
		twwrap.refreshAll = function(sec){
			// Refresh the wrapper twwrap,
			// and synchronize all transcluded copies.
			return twve.wrapper.refreshAll(twwrap,sec);
		};
		// refresh self
		twwrap.refreshSelf = function(sec){
			return twve.wrapper.refreshSelf(twwrap,sec);
		};
		// multi line
		twwrap.multiLine = function(){
			return true;
		};
		// check and prepare
		twwrap.checkAndPrepare = function($subfoldable,subfolded){
			// This method can be called
			//	1.	upon loading,
			//	2.	upon refreshing.
			// In cases of the 2nd type, this wrapper must have been
			// unfolded (in twve.wrapper.refreshAll), we don't need
			// to take care of that here. In cases of the first, however,
			// this wrapper may or may not be unfolded, we need to take
			// care of that here.
			//if ( twwrap.tiddler && twwrap.$dom ) {
				// Check the folding status of this wrapper
				var $folded = twwrap.isVisible()
					? null
					: twwrap.$dom;
				var animated = config.options.chkAnimate;
				config.options.chkAnimate = false;
				// Unfold it if folded
				if ( $folded ) {
					// unfold it to refresh the wrapper
					twve.wrapper.unfold($folded);
				}
				// Unfold sub-wrappers if there are
				if ( $subfoldable === undefined ) {
					$subfoldable = twve.wrapper.findElements(
						twwrap.$dom,
						twve.tiddler.twveFoldableSelector()
					);
					subfolded=twve.wrapper.recordFoldable($subfoldable);
				}
				if ( $subfoldable) $subfoldable.show();
				// Prepare it
				twve.wrapper.prepareElements(twwrap);
				// Fold back the sub-wrappers if necessary
				if ( $subfoldable)
					twve.wrapper.restoreFoldable(
						$subfoldable,subfolded
					);
				// Fold back this wrapper if necessary
				if ( $folded ) {
					// fold it back
					twve.wrapper.fold($folded);
				}
				config.options.chkAnimate = animated;
			//}
			return twwrap;
		};
		// wait
		var pid = null;
		twwrap.wait = function(){
			if ( ! anim.running ) {
				clearInterval(pid);
				twwrap.checkAndPrepare();
			}
		};
		// waitAndPrepare
		twwrap.waitAndPrepare = function () {
			// If animation is enabled and running, we should wait
			// until it's done or the rendering can be wrong.
			pid = null;
			if ( readOnly ||
				! config.options.chktwveCoreEnabled )
				return;
			if ( config.options.chkAnimate && anim.running ) {
				pid = setInterval(twwrap.wait, 50);
			} else {
				twwrap.checkAndPrepare();
			}
		};

		return twwrap.created(wrap);
	}
};
//}}}
/***
!!! twve.viewer
***/
//{{{
twve.viewer = {
//}}}
/***
!!!! twve.viewer.twveSelector
***/
//{{{
	enableEdit : true,
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('div.viewer');
		return selector;
	},
//}}}
/***
!!!! twve.viewer.titleOfWrapper
***/
//{{{
	titleOfWrapper : function ($w) {
		// Non-trnascluded wrapper or the tiddler title div.
		return $w.closest('[tiddler]').attr('tiddler');
	},
//}}}
/***
!!!! twve.viewer.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, $parent){
		// Non-transcluded
		return $parent.find('div[tiddler*="'+title+'"] .viewer');
	},
//}}}
/***
!!!! twve.viewer.create
***/
//{{{
	create : function(src){
		var viewer = twve.wrapper.create(src);
		viewer.clone = function(){
			return twve.viewer.create(viewer);
		};
		return viewer;
	}
};
//}}}
/***
!!! twve.tabContent
***/
//{{{
twve.tabContent = {
//}}}
/***
!!!! twve.tabContent.twveSelector
***/
//{{{
	enableEdit : true,
	getSelector : function(){
		return 'div.tabContents';
	},
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('div.tabContents');
		return selector;
	},
//}}}
/***
!!!! twve.tabContent.titleOfWrapper
***/
//{{{
	titleOfWrapper : function ($w) {
		// <<tabs>> transcluded wrapper.

		// It suffices to use $w.prev().find(...) to locate the
		// selected tab and retrieve the tiddler title from
		// its attribute "content". I thought using $.prev()
		// should be faster than $w.parent() and did some test
		// to confirm my idea. In contrary I found them pretty
		// much the same performance when the content is fully
		// transcluded. More surprisingly, when the content
		// is partially transcluded, $w.parent() is better than
		// $w.prev() for sure. Therefore $w.parent(), instead
		// of $w.prev(), is used here to find the tiddler
		// title.

		//return $w.prev().find('.tabSelected')
		//			.attr('content');
		return $w.parent().find('.tabSelected')
				.attr('content');
	},
//}}}
/***
!!!! twve.tabContent.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, $parent){
		// <<tabs>> transcluded
		return $parent.find(
			'.tabSelected[content*="'+title+'"]'
		).parent().next();
	},
//}}}
/***
!!!! twve.tabContent.create
***/
//{{{
	create : function(src){
		var tabContent = twve.wrapper.create();
		tabContent.clone = function(){
			return twve.tabContent.create(tabContent);
		};
		return tabContent.created(src);
	}
};
//}}}
/***
!!! twve.transcludedElem
***/
//{{{
twve.transcludedElem = {
//}}}
/***
!!!! twve.transcludedElem.create
***/
//{{{
	create : function(src){
		var elem = null;
		if ( src && ! src.$dom ) {
			var focus = twve.tiddler.focusElem();
			if ( focus && focus.$dom.is(src.parent()) ) {
				elem = twve.element.create();
			}
		}
		return elem;
	}
};
//}}}
/***
!!! twve.tiddlerSpan
***/
//{{{
twve.tiddlerSpan = {
//}}}
/***
!!!! twve.tiddlerSpan.twveSelector
***/
//{{{
	enableEdit : true,
	getSelector : function(){
		return 'span[tiddler]';
	},
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('span[tiddler]');
		return selector;
	},
//}}}
/***
!!!! twve.tiddlerSpan.titleOfWrapper
***/
//{{{
	titleOfWrapper : function ($w) {
		// <<tiddler>> transcluded wrapper.
		return $w.attr('tiddler');
	},
//}}}
/***
!!!! twve.tiddlerSpan.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, $parent){
		// <<tiddler>> transcluded
		return $parent.find('span[tiddler*="'+title+'"]');
	},
//}}}
/***
!!!! twve.tiddlerSpan.wikiTags
***/
//{{{
	wikiTags : function(){
		// <<tiddler>> transcluded
		return twve.tags.create(
			'<<tiddler',
			'>>'
		);
	},
//}}}
/***
!!!! twve.tiddlerSpan.create
***/
//{{{
	create : function(src){
		var tiddlerSpan = twve.transcludedElem.create(src)
			|| twve.wrapper.create();
		// wikiTags
		tiddlerSpan.wikiTags = function(){
			return twve.tiddlerSpan.wikiTags();
		};
		// clone
		tiddlerSpan.clone = function(){
			return twve.tiddlerSpan.create(tiddlerSpan);
		};
		return tiddlerSpan.created(src);
	}
};
//}}}
/***
!!! twve.sliderPanel
***/
//{{{
twve.sliderPanel = {
//}}}
/***
!!!! twve.sliderPanel.twveSelector
***/
//{{{
	enableEdit : true,
	getSelector : function(){
		return 'div.sliderPanel';
	},
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('div.sliderPanel');
		return selector;
	},
//}}}
/***
!!!! twve.sliderPanel.titleOfWrapper
***/
//{{{
	titleOfWrapper : function ($w) {
		// <<slider>> transcluded wrapper.
		return $w.attr('tiddler');
	},
//}}}
/***
!!!! twve.sliderPanel.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, $parent){
		// <<slider>> transcluded
		return $parent.find(
			'div.sliderPanel[tiddler*="'+title+'"]'
		);
	},
//}}}
/***
!!!! twve.sliderPanel.wikiTags
***/
//{{{
	wikiTags : function(){
		// <<slider>> transcluded
		return twve.tags.create(
			'<<slider',
			'>>'
		);
	},
//}}}
/***
!!!! twve.sliderPanel.create
***/
//{{{
	create : function(src){
		var sliderPanel = twve.transcludedElem.create(src)
			|| twve.wrapper.create();
		// wikiTags
		sliderPanel.wikiTags = function(){
			return twve.sliderPanel.wikiTags();
		};
		// clone
		sliderPanel.clone = function(){
			return twve.sliderPanel.create(sliderPanel);
		};
		return sliderPanel.created(src);
	}
};
//}}}
