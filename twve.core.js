/***
|editable|k
|''Name:''|twve.core|
|''Description:''|Core codes of twve, the ~TiddlyWiki View mode Editor, providing easy access to the defining wiki text corresponding to a DOM element, and the synchronization capability for multiply transcluded copies of a tiddler.|
|''Author:''|Vincent Yeh (qmo.wcy2@gmail.com)|
|''Source:''|* (minimized) http://twve.tiddlyspot.com/#twve.core.min / http://twve.tiddlyspace.com/#twve.core.min <br>* (regular) http://twve.tiddlyspot.com/#twve.core / http://twve.tiddlyspace.com/#twve.core|
|''Type:''|plugin|
|''Version:''|3.2.1|
|''Status:''|This plugin is still under development.<br>You are welcome to try and send feedback. :-)|
|''Date:''|2014/11/21 said goodbye to jQuery<br>2014/05/13 released 3.0.0 <br>2014/01/18 collected from TWElement, TWtid and TWted|
|''License:''|MIT|
|''Core Version:''|2.7.0|

!!Features:
* Access to the defining wiki text corresponding to a DOM element.
** Locate the wiki text corresponding to a given DOM element.
** Get/Set the wiki text corresponding to a given DOM element.
* Synchronization between multiply transcluded copies in ~TiddlyWiki environment.
** Synchronize the output of multiply transcluded copies of a DOM element after changes.

!!Usage:

!!Options
Look for [[twve.core Options]] in the Options Panel.

!!Examples
[[twve.core Examples]]
!!Todo:

!!!Revision history
!!!! 2014/11/28 [3.2.1]
* Bug fix
** for mobile devices to hide the edit box upon clicking away.
!!!! 2014/11/21 [3.2.0]
* Removed jQuery dependencies for migrating to ~TW5.
** Could be incompatible with earlier browsers.
* Bug fix
** for refreshing a mixture of partially transcluded sections/slices;
** for transclusion synchronization of transcluded slices;
** for floating menu auto-positioning;
** for keeping a minimum edit box width.
!!!! 2014/08/03 [3.1.0]
* Supports editing of transcluded slices.
* Started to remove jQuery dependencies for migrating to TW5.
* Bug fix
** for occasionally oversize preview box;
*** Sometimes the preview box gets unreasonably larger than the expected height, and the reason seemed related to the width of the previewer: If the width was much smaller in the last time, it gets higher, depending on the length of the content, in this preview.
*** The fix: Set the previewer width to that of the editbox before wikifying the content.
** for obtaining the bounding box of elements;
** for transclusion synchronization with self inclusion and FoldedSectionPlugin.
** for twve.node.info(node) when node is null or undefined.
!!!! 2014/06/02 [3.0.3]
* Added option {{{chktwveCoreEditWrappers}}} to enable/disable wrapper editing (including tiddler title).
** The Options Menu still available at the top-right corner of the tiddler title area.
* Moved out the codes to edit heading, preformatted blocks, and code blocks to ''twve.extra''.
* Bug fixes
** for the width of the bounding box;
*** Previously the ''twve'' used the {{{.clientWidth}}} property of a DOM element to determine the width of the bounding box, which worked fine in most of the browser/OS combinations, except for Opera/Linux. This version uses {{{.innerWidth()}}} method of jQuery and it works fine.
** for compatibility with {{{NestedSlidersPlugin}}};
** for transclusion synchronization with self-inclusion.
!!!! 2014/05/23 [3.0.2]
* Smarter positioning of the floating menu.
** If the menu is too wide to show to the left, it will be shown to the right.
* Moved the following codes from ''twve.extra'':
** that to avoid editing when clicking a link;
** that to show Options Menu for ''twve.core''.
* Bug fixes
** for showing the Options Menu in Andriod/iOS;
** for getting the bounding box of a textnode;
** for adjusting the focusing borders upon switching tabs;
** for editing the tiddler title;
** for distinguishing CODE blocks and PRE blocks that are created with """{{{""" and """}}}""";
** for previewer to work with FoldHeadingsPlugin;
** for """$dom[0] is undefined""" error in node.isVisible() with TiddlySpot.
!!!! 2014/05/14 [3.0.1]
* Moved in the codes for pretty links from ''twve.extra''.
* Removed some debugging codes for handling shadow tiddlers.
!!!! 2014/05/13 [3.0.0]
* ''Easily incorporated into other plugins.''
** Redesigned code structure and largely rewritten code pieces for easy incorporation into other pugins. See [[Edit Your ...]] for more information.
* Improved {{{partial refreshing}}} features.
** Partial refreshing is to refresh only the changed part, instead of the whole of a tiddler, to improve performance of the plugins.
*** In the earliest versions the plugins did not do partial refreshing but only whole tiddler refreshing. This is usually fine when the tiddler is small, but can be slow when is large.
**** In addition, whole tiddler refreshing destroys the original DOM elements and recreates new ones, causing the plugins to pay extra efforts to bookkeep the status of elements for later uses.
*** Later time partial refreshing was implemented for table cells.
*** Even later time this feature was extended to cover other elements, such as list items, headings, blockquotes, etc, for simple cases.
**** For not-so-simple cases, such as changed level in headings or list items, or whole table refreshing, the plugins still did whole tiddler refreshing.
*** This version further extended the feature to cover whole tables and transcluded sections.
* Bug fixes
** for correct section title searching
*** Previously the section title was located with the criteria {{{.indexOf()>-1}}}, which could make mistakes when one section title is part of another preceding it. This version fixed this issue by making sure the section title, after removing the leading !'s and white spaces, does start with the searched pattern.
** for consistent alignment behavior in preview box
** for element level transclusion synchronization
*** Refreshing a table contained in a {{{FoldHeadingsPlugin}}} folded section can mess up the page. It is fixed in this version.
* Changed the return policy of internal functions {{{indexOf}}} and {{{lastIndexOf}}}.
** These two internal functions search in a string for 1) a certain pattern or 2) an array of equivalent patterns. Because of 2) their return value is an object consisting of {{{ndx}}} and {{{matched}}} properties. If a pattern is found, {{{ndx}}} is the index of the matched pattern, while the {{{matched}}} is the actually matched pattern. If, however, no pattern is found, the previous version set the {{{ndx}}} to {{{-1}}} but left the {{{matched}}} untouched as whatever it was, causing confusion some times. This version clears the {{{matched}}} property if no pattern is found.
!!!! 2014/01/18
* Collected from [[TWtid|http://twtable.tiddlyspace.com/#TWtid.2.0.10]] and [[TWted|http://twtable.tiddlyspace.com/#TWted.2.0.10]], adapted to the new code structure.

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
	major: 3, minor: 2, revision: 0,
	date: new Date('2014/11/21')
};
//}}}
/***
!!! Macro for initialization and option settings.
***/
//{{{
config.macros.twveCoreOptions = {
	identifyWebkitBrowser : function(){
		if ( config.browser.isSafari )
			if ( config.browser.isChrome ) {
				config.browser.isSafari = false;
					if ( /opr/.test(config.userAgent) ) {
						config.browser.isOpera = true;
						config.browser.isChrome = false;
					}
			}
	},
	// Initialization procedure
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
				+' qmo.wcy2@gmail.com. Thanks a lot.'
			);
		config.browser.isWin7 = /nt 6\.1/.test(config.userAgent);
		config.browser.isWin8 = /nt 6\.3/.test(config.userAgent);
		config.browser.isWinXP = /nt 5\.1/.test(config.userAgent);
		// Andtidwiki would be recognized as Safari on Linux and android.
		config.browser.isAndroid = /android/.test(config.userAgent);
		config.browser.isiOS = /ip(.*?)mac/.test(config.userAgent);
		// Distinguish webkit browsers.
		config.macros.twveCoreOptions.identifyWebkitBrowser();

		window.addEventListener(
			'resize',
			function(ev){
				twve.tiddler.resize(ev || window.event);
			}
		);
		/*
		window.onscroll = function(ev){
			twve.tiddler.scroll(ev || window.event);
		};
		*/

		// Newly defined
		if ( config.options.chktwveCoreEditWrappers===undefined )
			config.options.chktwveCoreEditWrappers = false;
		merge ( config.optionsDesc, {
			chktwveCoreEditWrappers:"Edit wrappers and tiddler title, default to false<br>(The ''twve.extra'' will automatically enable this feature, regardless of this setting)."
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
		if ( config.options.txttwveCoreMinEditWidth===undefined )
			config.options.txttwveCoreMinEditWidth = 6;
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
			txttwveCoreMinEditWidth:'Minimum edit box width (characters). Default value is 6.',
			txttwveCorePreviewHeight:'Previewer max height (lines of text). Default to 15.',
			txttwveCorePreviewCaret:'Caret in the previewer. Default to vertical line (|)',
			chktwveCoreConfirmToDelete:'Confirm before deleting elements.',
			chktwveCoreClickAway:'Click away to accept changes.',
			chktwveCoreManualSave:'Save changes to file manually. If true, a button labeled "S" will be provided for manual save. Otherwise the file will be saved each time a change is accepted.',
			chktwveCoreManualUpload:'Upload changes to server manually. If true, a button labeled "U" will be provided for manual upload. Otherwise all changes will be uploaded each time a change is accepted.'
		} );

		//twve.tiddler.preCloseAllTiddlers = story.closeAllTiddlers;
		//story.closeAllTiddlers = twve.tiddler.closeAllTiddlers;

		twve.tiddler.preEditHandler=config.commands.editTiddler.handler;
		config.commands.editTiddler.handler=twve.tiddler.editHandler;
		twve.tiddler.precloseTiddler=story.closeTiddler;
		story.closeTiddler=twve.tiddler.closeTiddler;
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

		// Register wrappers
		twve.tiddler.registerWrapper(twve.tiddlerTitle);
		twve.tiddler.registerWrapper(twve.viewer);
		twve.tiddler.registerWrapper(twve.tabContent);
		twve.tiddler.registerWrapper(twve.tiddlerSpan);
		twve.tiddler.registerWrapper(twve.sliderPanel);
	},

	order : {
		// From TWtid
		chktwveCoreEnabled:0,
		chktwveCoreShowFocus:1,
		// Newly defined
		chktwveCoreEditWrappers:2,
		// From TWted
		txttwveCoreMinEditWidth:3,
		txttwveCorePreviewHeight:4,
		chktwveCorePreview:5,
		txttwveCorePreviewCaret:6,
		chktwveCoreConfirmToDelete:7,
		chktwveCoreClickAway:8,
		chktwveCoreManualSave:9,
		chktwveCoreManualUpload:10
	},

	collectOptions : function (key, order) {
		// Collect twve options.
		var ttopts = [];
		for ( var n in config.options ) {
			if ( n.indexOf(key) >= 0 ) {
				var msg = config.optionsDesc[n];
				if ( ! msg ) continue;
				var pdot = msg.indexOf('.');
				if ( pdot > -1 ) {
					if ( msg.substring(pdot-4,pdot) == 'twve' ) {
						pdot = msg.indexOf('.',pdot+1);
						pdot == -1 ? (pdot=msg.length) : (pdot++);
					}
				} else pdot = msg.length;
				ttopts[ttopts.length] = (
					'\n|<<option '+n+'>>|'+msg.substring(0,pdot)+' |'
				);
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
		for ( var i=0,len=ttopts.length; i<len; i++) {
			opts += ttopts[i];
		}
		return opts;
	},
	showOptionsTable : function (place, cap, key, order) {
		var div_opt = document.createElement('div');
		place.appendChild(div_opt);
		var opts = this.prepareOptionsTable(cap,key,order);
		// Render the table.
		wikify ( opts, div_opt );
		// Adjust width
		var table = div_opt.querySelector('table');
		twve.node.setDimension(table,'35em');
		twve.node.setDimension(
			table.querySelectorAll('input'),'5em'
		);
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
	/*
	isArray : function(obj){
		return Object.prototype.toString.call(obj).indexOf('Array')>-1;
	},
	*/
	isCollection : function(obj){
		return obj &&
			obj.length !== undefined &&
			typeof obj == 'object';
	},
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
				if ( obj.nodeType ) {
					return twve.node.info(obj);
				} else if ( obj.title && obj.modifier ) {
					// tiddler object
					return '{title: '+obj.title+' ...}';
				}
				var val = '{';
				var keys = twve.object.keys(obj);
				for ( var n=0,len=keys.length; n<len; n++ ){
					val += (n==0?'':', ')+'\n\t'+keys[n]+':';
					var v = obj[keys[n]];
					if ( v ) {
						if ( ++twve.object.level < 5 ) {
							val += twve.object.toString(v);
							--twve.object.level;
						}
					} else
						val += v;
				}
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
	keys : function(obj,all) {
		var keys = [];
		for ( var key in obj ) {
			if ( all || typeof obj[key] != 'function' ) {
				keys[keys.length] = key;
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
			case 'function' :
				dest[key] = src[key];
				break;
			default :
				if ( ! src[key] ) break;
				dest[key] = twve.object.create();
				var keys = twve.object.keys(src[key],true);
				for ( var n=0,len=keys.length; n<len; n++ )
					twve.object.copyKey(dest[key],src[key],keys[n]);
				break;
		}
		return dest;
	},
//}}}
/***
!!!! twve.object.copyKeys
***/
//{{{
	copyKeys : function(dest,src,keys){
		for ( var i=0, len=keys.length; i<len; i++ ) {
			twve.object.copyKey(dest,src,keys[i]);
		}
		return dest;
	},
//}}}
/***
!!!! twve.object.create
***/
//{{{
	create : function(src) {
		var obj = new Object;
		// clone
		obj.clone = function(){
			return twve.object.create(obj);
		};
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
				keys || src.keys()
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
		// End of obj
		return obj.created(src);
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
!!!! twve.text.markupTags
***/
//{{{
	markupTags : function(){
		var tags = twve.tags.create(
			[ "\'", '\"' ],
			[ "\'", '\"' ]
		);
		tags.clone = function(){
			// Optional, may save a tiny bit of time.
			return twve.text.markupTags();
		};
		return tags;
	},
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
	lastIndexOf : function(str,val,start,all){
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
			var ndx = [], i;
			for ( i = 0; i < val.length; i++ )
				ndx[i] = str.lastIndexOf(val[i],start.ndx);
			start.ndx = ndx[0];
			start.matched = start.ndx > -1 ? val[0] : '';
			var last = start;
			for ( i = 1; i < val.length; i++ ) {
				if ( ndx[i] == -1 ) continue;
				if ( start.ndx == -1 || (!all && ndx[i]>start.ndx) ) {
					start.ndx = ndx[i];
					start.matched = val[i];
				} else {
					last.next = twve.position.create(ndx[i],val[i]);
					last = last.next;
				}
			}
		}
		/*
		if ( start.next ) {
			// There are more than one values matched. Make sure they do
			// not interfere with each other.
			var cur = start;
			var curprev = cur;
			while ( cur ) {
				var remove = false;
				var tmp = start;
				do {
					if ( tmp != cur && tmp.ndx < cur.ndx &&
						cur.ndx < tmp.ndx+tmp.matched.length ) {
						// cur is interfering with tmp, remove cur
						remove = true;
						break;
					}
					tmp = tmp.next;
				} while ( tmp );
				var curnext = cur.next;
				if ( remove ) {
					if ( cur == start )
						curprev = start = curnext;
					else
						curprev.next = curnext;
				} else {
					curprev = cur;
				}
				cur = curnext;
			}
		}
		*/
		return start;
	},
//}}}
/***
!!!! twve.text.indexOf
***/
//{{{
	indexOf : function (str,val,start,all) {
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
			var ndx = [], i;
			for ( i = 0; i < val.length; i++ )
				ndx[i] = str.indexOf(val[i],start.ndx);
			start.ndx = ndx[0];
			start.matched = start.ndx > -1 ? val[0] : '';
			for ( i = 1; i < val.length; i++ ) {
				if ( ndx[i] == -1 ) continue;
				if ( start.ndx == -1 || (!all && ndx[i]<start.ndx) ) {
					start.ndx = ndx[i];
					start.matched = val[i];
				} else {
					start.next = twve.position.create(ndx[i],val[i]);
				}
			}
		}
		return start;
	},
//}}}
/***
!!!! twve.text.skipToActive
***/
//{{{
	skipToActive : function(txt,pattern,start,end,inactiveTags){
		// Find pattern in txt, skipping those enclosed by inactive
		// tags.
		// The pattern to be searched can be either a single string or an array
		// of strings.
		// Returns a twve.position object that consists of
		//	{
		//		ndx: The index of the next pattern that is active
		//			(not enclosed by any inactive tags) if found, or
		//			-1 otherwise.
		//		matched: The matched pattern if found, or empty string if not.
		//				If found, then this is the pattern itself if the pattern
		//				is a single string, or the actually matched pattern if
		//				pattern is an array of strings.
		//	}
		if ( ! start ) start = twve.position.create(0);
		else if ( typeof start == 'number' )
			start = twve.position.create(start);
		if ( ! end ) end = twve.position.create(txt.length);
		else if ( typeof end == 'number' )
			end = twve.position.create(end);
		var pos = twve.position.create(start);
		pos = twve.text.indexOf(txt,pattern,pos);
		if ( pos.ndx == start.ndx ) return pos;
		if ( pos.ndx > end.ndx ) { pos.ndx = -1; return pos; }
		if ( ! inactiveTags ) inactiveTags = twve.tags.inactiveTags();
		var invalidEnd = twve.position.create(pos);
		while ( pos.ndx > start.ndx && pos.ndx < end.ndx
			&& (invalidEnd=inactiveTags.encloses(txt,pos.ndx,start,end)) ) {
			pos.ndx = invalidEnd.ndx+invalidEnd.matched.length;
			pos = twve.text.indexOf(txt,pattern,pos);
		}
		if (pos.ndx < start.ndx || pos.ndx > end.ndx) pos.ndx = -1;
		return pos;
	},
//}}}
/***
!!!! twve.text.consecutiveLinesEnd
***/
//{{{
	consecutiveLinesEnd : function (txt,start,alltheway,ch,tags){
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
		//				the way but stop when we see the level changes.

		var p0 = 0;
		switch (typeof start) {
			case 'number' :
				p0 = start;
				break;
			case 'object' :
				if ( start.ndx ) p0 = start.ndx;
				break;
		}
		var txtlen = txt.length;
		// Move to the beginning of line
		if ( txt.charAt(p0) == '\n' ) {
			p0++;
		} else
			while ( p0 > 0 && txt.charAt(p0-1) != '\n' ) p0--;
		// p0 should point at the first character of a line of text.
		var level = twve.leveledElement.getLevel(txt,p0,ch);
		var end = twve.position.create(p0,'\n');
		if ( level == 0 ) return end;
		end.ndx = txt.indexOf(end.matched,p0);
		if ( end.ndx == -1 ) {
			end.ndx = txtlen;
			end.matched = '';
			return end;
		}
		if ( ! tags )
			tags = twve.tags.create(
				('\n'+txt.substring(p0,p0+level)), '\n'
			);
		var nextstart = twve.position.create(end);
		do {
			nextstart = twve.text.indexOf(txt,tags.open,nextstart);
			// Break if
			//	1.	not an immediately following line,
			//	2.	not the same level && not alltheway
			if ( nextstart.ndx != end.ndx ||
				(! alltheway &&
					twve.leveledElement.getLevel(
						txt,nextstart.ndx+1,ch
					)!=level) )
				break;
			// The next leveled element at the next line has the same
			// level as this one., or we are going all the way.
			// Look for its end.
			end.ndx = nextstart.ndx+nextstart.matched.length;
			end = twve.text.indexOf(
				txt, tags.exactCloseTag(nextstart.matched).close, end
			);
			if ( end.ndx == -1 ) {
				end.ndx = txtlen;
				end.matched = '';
				break;
			}
			nextstart.ndx = end.ndx;
		} while ( true );
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
!!!! twve.tags.inactiveTags
***/
//{{{
	_inactive_tags : null,
	inactiveTags : function(){
		// Returns tags of inactiveTags elements: elements that can
		// inactivate others, such as preformatted blocks, code, etc.
		if ( ! twve.tags._inactive_tags ) {
			twve.tags._inactive_tags = twve.pre.markupTags().merge(
				twve.code.markupTags()
			).merge(
				twve.link.markupTags()
			).merge(
				twve.tags.create('"""', '"""')
			);
			twve.tags._inactive_tags.clone = function(){
				// Optional, may save a tiny bit of time.
				return twve.tags.create();
			}
		}
		return twve.tags._inactive_tags;
	},
//}}}
/***
!!!! twve.tags.create
***/
//{{{
	create : function(src,close){
		var tags = twve.object.create();
		// sameTag
		tags.sameTag = function(tag1, tag2){
			if ( ! tag1 )
				// There is no tag1.
				return tag2 ? false : true;
			else if ( ! tag2 )
				// There is tag1 but no tag2.
				return false;
			// There are both tag1 and tag2.
			if ( typeof tag1 == 'string' ) {
				// tag1 is a string
				if ( typeof tag2 == 'string' ) {
					// tag2 is also a string
					return tag1 == tag2;
				} else {
					// tag2 is an array
					var pos = twve.position.create(0);
					pos = twve.text.indexOf(tag1,tag2,pos);
					return pos.ndx >= 0;
				}
			} else {
				// tag1 is an array
				if ( typeof tag2 == 'string' ) {
					// tag2 is a string
					var pos = twve.position.create(0);
					pos = twve.text.indexOf(tag2,tag1,pos);
					return pos.ndx >= 0;
				} else {
					// tag2 is also an array, they must be identical
					// to be the same.
					if ( tag1.length != tag2.length ) return false;
					for (var n=0; n<tag1.length; n++)
						if ( tag1[n] != tag2[n] ) return false;
					return true;
				}
			}
		};
		// is
		tags.is = function(another){
			return tags.sameTag(tags.open, another.open)
				&& tags.sameTag(tags.close, another.close);
		};
		// notEnclosing
		//tags.notEnclosing = function(){
		//	return tags.open == tags.close;
		//};
		// clone
		tags.clone = function(){
			return twve.tiddler.markupTags(tags)
				|| twve.tags.create(tags);
		};
		// firstTagString
		tags.firstTagString = function(txt,start,tagstr){
			var tag = tagstr;
			var len = tag.length;
			if ( tag.charAt(0)=='\n' && txt.charAt(0)!='\n' ) {
				// If txt does not start with a '\n' but tag does,
				// remove it.
				tag = tag.substring(1);
				len--;
			}
			if ( txt.substring(0,len) == tag ) {
				start.ndx = 0;
				start.matched = tagstr;
			} else {
				start.ndx = -1;
				start.matched = '';
			}
			return start;
		};
		// firstOpenTag
		tags.firstOpenTag = function(txt,start){
			// The open tag at the very beginning of txt.
			if ( typeof tags.open == 'string' ) {
				// tags.open is a string
				tags.firstTagString(txt,start,tags.open);
			} else {
				// tags.open is an array
				for (var n = 0; n < tags.open.length; n++ ) {
					tags.firstTagString(txt,start,tags.open[n]);
					if ( start.ndx == 0 ) return start;
				}
			}
			return start;
		};
		// nextOpenTag
		tags.nextOpenTag = function(txt,start,inactiveTags) {
			if ( start.ndx <= 0 ) {
				tags.firstOpenTag(txt,start);
				if ( start.ndx == 0 ) return start;
				start.ndx = 0;
			} else if (txt.charAt(start.ndx) != '\n' &&
				txt.charAt(start.ndx-1) == '\n') {
				start.ndx--;
			}
			//return twve.text.indexOf(txt,tags.open,start);
			return twve.text.skipToActive(
				txt,tags.open,start,null,inactiveTags
			);
		};
		// exactCloseTag
		tags.exactCloseTag = function(open){
			if ( open && (typeof tags.open == 'object') ) {
				var exactTags = tags.clone();
				exactTags.open = open;
				exactTags.close = typeof tags.close == 'object'
					? tags.close[tags.open.indexOf(open)]
					: tags.close;
				return exactTags;
			}
			return tags;
		};
		// lastCloseTag
		tags.lastCloseTag = function(txt,end,txtlen){
			// The close tag at the very end of txt.
			if ( ! txtlen ) txtlen = txt.length;
			var close = tags.close;
			var clen = close.length;
			if( tags.close.charAt(clen-1)=='\n' &&
				txt.charAt(txtlen-1) != '\n' )
				// The close tag expects an ending \n, while the txt
				// does not have one at the end.
				close = close.substring(0,--clen);
			if ( txt.substring(txtlen-clen) == close ) {
				end.ndx = txtlen-clen;
				end.matched = close;
			} else {
				end.ndx = -1;
				end.matched = '';
			}
			return end;
		}
		// matchedCloseTag
		tags.matchedCloseTag = function(txt,pos,txtlen,inactiveTags){
			// Find the close tag that corresponds to the current
			// opening tag. In simple cases we just go for the next
			// close tag.
			var ndx = pos.ndx;
			//pos = twve.text.indexOf(txt,tags.close,pos);
			pos = twve.text.skipToActive(
				txt,tags.close,pos,null,inactiveTags
			);
			if ( pos.ndx > -1 ) return pos;
			pos.ndx = ndx;
			return tags.lastCloseTag(txt,pos,txtlen);
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

			// Prepare for searching.
			if ( ndx == 0 || ndx >= txt.length-1 )
				return null;
			start = twve.position.create(start);
			end = twve.position.create(end);
			if ( start.ndx < 0 ) start.ndx = 0;
			if ( end.ndx <= start.ndx || end.ndx > txt.length )
				end.ndx = txt.length;
			// Search backward for opening tags.
			var open = twve.position.create(ndx);
			open = twve.text.lastIndexOf(
				txt,tags.open,open,true
			);
			if ( open.ndx < 0 ) return null;
			do {
				if ( open.ndx >= start.ndx &&
					open.ndx+open.matched.length <= ndx ) {
					// The opening index is before ndx, search forward
					// for its closing tags.
					var exactTag = tags.exactCloseTag(open.matched);
					//if ( exactTag.notEnclosing() ) return null;
					var close = twve.position.create(
						open.ndx+open.matched.length
					);
					close = twve.text.indexOf(txt,exactTag.close,close);
					if ( close.ndx > ndx && close.ndx < end.ndx )
						// The index ndx is between the opening and
						// closing positions, meaning it is enclosed by
						// this pair of tags, return the closing
						// position.
						return close;
					// Otherwise move the start.ndx to this close.ndx, because
					// anything between this pair of opening and closing tags
					// shall be considered inactive.
					start.ndx = close.ndx;
				}
				// Otherwise check the next pair, if there is.
				open = open.next;
			} while ( open );
			return null;
		};
		// mergeTag
		tags.mergeTag = function(tag,newtag){
			if ( ! tag ) return newtag;
			if ( ! newtag ) return tag;
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
					for (var i=0,len=newtag.length; i<len; i++)
						if ( tag.indexOf(newtag[i]) == -1 )
							tag[tag.length] = newtag[i];
				}
			} else {
				// tag is an array
				if ( typeof newtag == 'string' ) {
					// newtag is a string
					if ( tag.indexOf(newtag) == -1 )
						tag[tag.length] = newtag;
				} else {
					// newtag is also an array
					for (var i=0,len=newtag.length; i<len; i++)
						if ( tag.indexOf(newtag[i]) == -1 )
							tag[tag.length] = newtag[i];
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
		// creation codes
		if ( close ) {
			// If the 2nd argument close is given, it shall be the
			// close tag, and the 1st argument shall be the open tag.
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
!!! twve.link
***/
//{{{
twve.link = {
//}}}
/***
!!!! twve.link.twveSelector
***/
//{{{
	enableEdit : true,
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('a');
		return selector;
	},
//}}}
/***
!!!! twve.link.markupTags
***/
//{{{
	markupTags : function(){
		return twve.tags.create(
			'[[',
			']]'
		);
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
		//			# "markupTags" method to return the wiki
		//				tags of its kind. For example
		//					return twve.tags.create(
		//						"opening tag",
		//						"closing tag"
		//					);
		//				(If your editable element do have a pair of
		//				specific signatures, implement this method to
		//				return them. Otherwise just skip it.)
		//			# "create" method to create elements of its kind,
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
			twve.tiddler.registered_element = [];
			twve.tiddler.registered_element[
				twve.tiddler.registered_element.length
			] = obj;
		} else if(twve.tiddler.registered_element.indexOf(obj)==-1)
			twve.tiddler.registered_element[
				twve.tiddler.registered_element.length
			] = obj;
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
		//			# (Optional) "markupTags" method to return the wiki
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
			twve.tiddler.registered_wrapper = [];
			twve.tiddler.registered_wrapper[
				twve.tiddler.registered_wrapper.length
			] = obj;
		} else if(twve.tiddler.registered_wrapper.indexOf(obj)==-1)
			twve.tiddler.registered_wrapper[
				twve.tiddler.registered_wrapper.length
			] = obj;
	},
//}}}
/***
!!!! twve.tiddler.enableAllEditable
***/
//{{{
	enableAllEditable : function(enabled){
		// Enable/Disable all registered editable objects at the
		// same time.
		for ( var obj in twve.tiddler.registered_element )
			if ( obj.enableEdit )
				obj.enableEdit = (enabled !== false);
	},
//}}}
/***
!!!! twve.tiddler.readOnly
***/
//{{{
	readOnly : function(title){
		return /^twve--example/i.test(title)
			? false
			: readOnly;
	},
//}}}
/***
!!!! twve.tiddler.registeredEditableObject
***/
//{{{
	registeredEditableObject : function(
		elem,registered,include_selector,which
	){
		if ( ! elem || ! registered
			|| !config.options.chktwveCoreEnabled )
			return null;
		// Finds the registered editable object that corresponds
		// to the type of elem (DOM node).
		var selector = twve.selector.create();
		// Go through the registered objects in a backward manner:
		// from the last to the first registered.
		for(var n = registered.length-1; n>=0; n--){
			var obj = registered[n];
			if ( obj.enableEdit ){
				if ( obj.is ) {
					// If obj has implemented is() function, test it.
					if ( obj.is(elem) )
						return include_selector
							? { obj: obj, selector: selector }
							: obj;
				} else {
					// Otherwise test its selectors.
					selector.clear();
					obj.twveSelector(selector,which);
					if ( twve.node.matches(elem,selector.include) &&
							(! selector.exclude ||
								!twve.node.matches(elem,selector.exclude)) )
						return include_selector
							? { obj: obj, selector: selector }
							: obj;
				}
			}
		}
		return null;
	},
//}}}
/***
!!!! twve.tiddler.createEditableElement
***/
//{{{
	createEditableElement : function(elem){
		// Creates an instance of the registered editable object
		// that corresponds to the type of elem (DOM node).
		var obj_sel = twve.tiddler.registeredEditableObject(
			elem,
			twve.tiddler.registered_element,
			true
		);
		if ( ! obj_sel ) return null;
		var twelem = obj_sel.obj.create
			? obj_sel.obj.create(elem)
			: twve.element.create(elem);
		return twelem && twve.tiddler.readOnly(twelem.wrapper_title)
			? null : twelem;
	},
//}}}
/***
!!!! twve.tiddler.twveSelector
***/
//{{{
	twveSelector : function(elem,which){
		// Finds the selector corresponding to element elem (DOM node).
		var obj_sel = twve.tiddler.registeredEditableObject(
			elem,
			twve.tiddler.registered_element,
			true, which
		);
		if ( ! obj_sel )
			obj_sel = twve.tiddler.registeredEditableObject(
				elem,
				twve.tiddler.registered_wrapper,
				true, which
			);
		return obj_sel ? obj_sel.selector : null;
	},
//}}}
/***
!!!! twve.tiddler.twveFoldableSelector
***/
//{{{
	twveFoldableSelector : function(){
		var selector = twve.sliderPanel.twveSelector();
		twve.foldedSection.twveSelector(selector);
		return selector;
	},
//}}}
/***
!!!! twve.tiddler.twveTranscludedSelectors
***/
//{{{
	twveTranscludedSelectors : function(){
		var selector = twve.selector.create();
		twve.tabContent.twveSelector(selector);
		twve.sliderPanel.twveSelector(selector);
		twve.tiddlerSpan.twveSelector(selector);
		return selector;
	},
//}}}
/***
!!!! twve.tiddler.cloneMarkupTags
***/
//{{{
	cloneMarkupTags : function(registered,tags){
		// Clones a twve.tags object.
		for(var n = registered.length-1; n>=0; n--){
			var obj = registered[n];
			if ( obj.enableEdit && obj.markupTags ){
				var objTags = obj.markupTags();
				if ( objTags.is(tags) ) return objTags;
			}
		}
		return null;
	},
//}}}
/***
!!!! twve.tiddler.markupTags
***/
//{{{
	markupTags : function(elem,which){
		// Finds the wiki tags corresponding to an element (DOM node),
		// or clones a twve.tags object.
		if ( elem.nodeType ) {
			// A DOM node
			var twobj = twve.tiddler.registeredEditableObject(
				elem, twve.tiddler.registered_element,
				false, which
			);
			if ( ! twobj ) {
				twobj = twve.tiddler.registeredEditableObject(
					elem, twve.tiddler.registered_wrapper,
					false, which
				);
			}
			return twobj && twobj.markupTags
				? twobj.markupTags() : null;
		} else {
			// A twve.tags object
			return twve.tiddler.cloneMarkupTags(
				twve.tiddler.registered_element,elem
			) || twve.tiddler.cloneMarkupTags(
				twve.tiddler.registered_wrapper,elem
			);
		}
	},
//}}}
/***
!!!! twve.tiddler.registeredSelectors
***/
//{{{
	registeredSelectors : function(registered,selector){
		if ( ! selector ) selector = twve.selector.create();
		for(var n = registered.length-1; n>=0; n--)
			registered[n].twveSelector(selector);
		return selector;
	},
//}}}
/***
!!!! twve.tiddler.elementSelectors
***/
//{{{
	elementSelectors : function(selector){
		return twve.tiddler.registeredSelectors(
			twve.tiddler.registered_element,selector
		);
	},
//}}}
/***
!!!! twve.tiddler.wrapperSelectors
***/
//{{{
	wrapperSelectors : function(selector){
		return twve.tiddler.registeredSelectors(
			twve.tiddler.registered_wrapper,selector
		);
	},
//}}}
/***
!!!! twve.tiddler.directWrapper
***/
//{{{
	directWrapper : function(elem,force){
		var w = twve.node.closest(
			elem.parentNode,
			twve.tiddler.wrapperSelectors().include
		);
		return w
			? twve.tiddler.createEditableWrapper(w,force)
			: null;
	},
//}}}
/***
!!!! twve.tiddler.createEditableWrapper
***/
//{{{
	createEditableWrapper : function(w,force){
		// Creates an instance of the registered editable wrapper
		// that corresponds to the type of w (DOM node), and finds
		// its wrapper title.
		var wrap = twve.tiddler.registeredEditableObject(
			w, twve.tiddler.registered_wrapper
		);
		if ( wrap ) {
			var twwrap = wrap.create
				? wrap.create(w)
				: twve.wrapper.create(w);
			if ( ! twwrap ) return null;
			twwrap.wrapper_title = wrap.titleOfWrapper(w);
			return force || !twve.tiddler.readOnly(twwrap.wrapper_title)
				? twwrap : null;
		}
		return null;
	},
//}}}
/***
!!!! twve.tiddler.createEditable
***/
//{{{
	createEditable : function(elem){
		// Creates an instance of the registered editable element
		// or wrapper that corresponds to the type of elem (DOM node).
		var editable = twve.tiddler.createEditableWrapper(elem);
		if ( ! editable ) {
			editable = twve.tiddler.createEditableElement(elem);
		}
		return (editable && editable.isSystemShadow())
			? null : editable;
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
			tweditable.dom,
			twve.tiddler.registered_element
		);
		if ( twobj )
			return twobj.create
				? twobj.create(tweditable)
				: twve.element.create(tweditable);

		twobj = twve.tiddler.registeredEditableObject(
			tweditable.dom,
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
	titleOfWrapper : function (w) {
		// Find the title of a given wrapper w (DOM node).
		if ( ! w ) return '';
		var twobj = twve.tiddler.registeredEditableObject(
			w, twve.tiddler.registered_wrapper
		);
		return (twobj && twobj.titleOfWrapper)
			? twobj.titleOfWrapper(w)
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
		// This function returns an array of DOM object representing all
		// the rendered copies of the corresponding tiddler title.

		if ( ! title ) return null;

		title = twve.text.removeHeaderTail(title);
		var tid_title = twve.text.tiddlerTitle(title);
		var sec = twve.text.tiddlerSection(title);
		var w0 = document.querySelectorAll('div[id=tiddlerDisplay]');
		var w = null;

		var registered_wrapper = twve.tiddler.registered_wrapper;
		for(var n = registered_wrapper.length-1; n>=0; n--){
			var wrap = registered_wrapper[n];
			if ( wrap.wrapperFromTitle ) {
				var w1 = wrap.wrapperFromTitle(
					tid_title, w0, sec
				);
				if ( ! w1 ) continue;
				w = w ? w.concat(w1) : w1;
			}
		}
		return w;
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
		return document.querySelector('div[id=displayArea]');
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
			twve.tiddler.optionsMenu.addMenu(
				"''twve.core'' Options",
				config.macros.twveCoreOptions.handler
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
	focusElem : function (twelem,action) {
		if ( typeof twelem != 'undefined' ) {
			// twelem is given
			if ( twve.tiddler.cur_focus
				&& twve.tiddler.cur_focus.blur )
				// There is currently focused element which is
				// different from the one to get focused (this is
				// made sure before calling this method).
				// Call its blur() method if it has it
				twve.tiddler.cur_focus.blur();
			if ( ! twelem ) {
				// Clear the focus, hide options menu as well.
				var menu = twve.tiddler.getOptionsMenu();
				if ( menu ) menu.hide(true);
				if ( ! /^keep/i.test(action) )
					twve.tiddler.drawFocusBorders();
			} else if ( twelem.focus )
				// call the focus() method of the newly focused
				// element if it has it
				twelem.focus();
			twve.tiddler.cur_focus = twelem;
		}
		return twve.tiddler.cur_focus;
	},
//}}}
/***
!!!! twve.tiddler.focusing_borders
***/
//{{{
	border_top : null,
	border_bottom : null,
	border_left : null,
	border_right : null,
//}}}
/***
!!!! twve.tiddler.createFocusBorder
***/
//{{{
	createFocusBorder : function(parent,which){
		if ( ! parent ) parent = twve.tiddler.getDisplay();
		// Create an array to hold each side of the borders.
		var border = document.createElement('div');
		parent.appendChild(border);
		border.style.position = 'absolute';
		twve.node.setDimension(border,null,0);
		switch ( which ) {
			case 'left' :
				border.style.borderLeftWidth = '1px';
				border.style.borderLeftStyle= 'dashed';
				break;
			case 'right' :
				border.style.borderRightWidth = '1px';
				border.style.borderRightStyle = 'dashed';
				break;
			case 'top' :
				border.style.borderTopWidth = '1px';
				border.style.borderTopStyle = 'dashed';
				break;
			case 'bottom' :
				border.style.borderBottomWidth = '1px';
				border.style.borderBottomStyle = 'dashed';
				break;
		}
		return border;
	},
//}}}
/***
!!!! twve.tiddler.focusBorderVisible
***/
//{{{
	focusBorderVisible : function(){
		return twve.node.isVisible(twve.tiddler.border_top[0]);
	},
//}}}
/***
!!!! twve.tiddler.prepareFocusBorders
***/
//{{{
	prepareFocusBorders : function(eb){
		// Prepare the focus borders and returns the number of boxes
		// to draw.
		// Left
		twve.node.setPosition(
			twve.tiddler.border_left[0],eb.left,eb.top
		);
		twve.node.setDimension(
			twve.tiddler.border_left[0],null,eb.height
		);
		// Top
		twve.node.setPosition(
			twve.tiddler.border_top[0],eb.left,eb.top
		);
		twve.node.setDimension(
			twve.tiddler.border_top[0],eb.width
		);
		// Bottom
		twve.node.setPosition(
			twve.tiddler.border_bottom[0],eb.left,eb.bottom
		);
		twve.node.setDimension(
			twve.tiddler.border_bottom[0],eb.width
		);
		// Right
		twve.node.setPosition(
			twve.tiddler.border_right[0],eb.right,eb.top
		);
		twve.node.setDimension(
			twve.tiddler.border_right[0],null,eb.height
		);
		return 1;
	},
//}}}
/***
!!!! twve.tiddler.focusBox
***/
//{{{
	focus_box : null,
	focusBox : function(){
		return twve.tiddler.focus_box;
	},
	clearFocusBox : function(){
		twve.tiddler.focus_box = null;
	},
//}}}
/***
!!!! twve.tiddler.drawFocusBorders
***/
//{{{
	drawFocusBorders : function(eb){
		if ( ! eb ) {
			twve.tiddler.focus_box = null;
			twve.node.hide(twve.tiddler.border_top);
			twve.node.hide(twve.tiddler.border_bottom);
			twve.node.hide(twve.tiddler.border_left);
			twve.node.hide(twve.tiddler.border_right);
		} else {
			twve.tiddler.focus_box = [{}];
			// Copy the 1st box.
			eb.cloneTo(twve.tiddler.focus_box[0],0,false);
			// Copy the outside box.
			eb.cloneTo(twve.tiddler.focus_box);
			// Prepare and show borders.
			var brdlen = twve.tiddler.prepareFocusBorders(eb);
			if ( config.options.chktwveCoreShowFocus ) {
				twve.node.show(twve.tiddler.border_top,0,brdlen);
				twve.node.show(twve.tiddler.border_bottom,0,brdlen);
				twve.node.show(twve.tiddler.border_left,0,brdlen);
				twve.node.show(twve.tiddler.border_right,0,brdlen);
			}
		}
	},
//}}}
/***
!!!! twve.tiddler.editWrappers
***/
//{{{
	editWrappers : function(){
		return config.options.chktwveCoreEditWrappers;
	},
//}}}
/***
!!!! twve.tiddler.focus
***/
//{{{
	focus : function(twelem,action,ev,eb) {
		var elem = null;
		if ( ! twelem || ! config.options.chktwveCoreEnabled ) {
			action = 'off';
		} else {
			elem = twelem.dom;
			if ( twve.node.closest(elem,'.preview') )
				return;
			if ( config.options.chktwveCoreNoClick ) {
				if(! twve.tiddler.cur_editable
					|| ! twve.tiddler.cur_editable.is(elem))
						twve.tiddler.editInPlace(twelem,ev);
			}
		}

		if ( ! twve.tiddler.border_top ) {
			// Focusing borders not existing. Create them.
			var display = twve.tiddler.getDisplay();
			twve.tiddler.border_top = [];
			twve.tiddler.border_top[0] =
				twve.tiddler.createFocusBorder(display,'top');
			twve.tiddler.border_bottom = [];
			twve.tiddler.border_bottom[0] =
				twve.tiddler.createFocusBorder(display,'bottom');
			twve.tiddler.border_left = [];
			twve.tiddler.border_left[0] =
				twve.tiddler.createFocusBorder(display,'left');
			twve.tiddler.border_right = [];
			twve.tiddler.border_right[0] =
				twve.tiddler.createFocusBorder(display,'right');
		}

		twve.tiddler.drawFocusBorders();
		if ( ! elem || action == 'off' ||
			(twelem.isWrapper() && ! twve.tiddler.editWrappers()) ) {
			twve.tiddler.focusElem(null);
		} else {
			twve.tiddler.focusElem(twelem);
			if ( ! eb ) eb = twelem.box('focus',ev);
			if(eb && eb.height>=twve.node.cssSize('font-size',elem)){
				if ( twelem.drawFocusBorders )
					twelem.drawFocusBorders(eb);
				else
					twve.tiddler.drawFocusBorders(eb);
				return true;
			}
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
		if ( ev ) {
			pos.x = ev.pageX;
			pos.y = ev.pageY;
		}
		return twve.node.adjustPosition(pos);
	},
//}}}
/***
!!!! twve.tiddler.focusTarget
***/
//{{{
	focusTarget : function(ev){
		// For simple elements/nodes, focus target is just ev.target.
		// For complex ones that containing multiple child
		// elements/nodes, such as tables, ev.target could be one of
		// the children, yet we may want the focus to be on the parent.
		return ev.target;
	},
//}}}
/***
!!!! twve.tiddler.mouseMove
***/
//{{{
	mouseMove : function(ev) {
		ev = ev || window.event;
		var focus = twve.tiddler.focusElem();
		var feb = null;
		var tweditable = null;
		var target = twve.tiddler.focusTarget(ev);
//if(target.nodeName=='SPAN'){var mnode=twve.MathJax.inline.getMathNode(target);if(mnode)console.log('target='+target+' mnode='+mnode);else console.log('target='+target);}
		if ( focus ) {
			if ( focus.is(target) ) {
				// Mouse is still over the same element.
				if ( focus.mousemove ) focus.mousemove(ev);
			} else {
				if ( config.browser.isAndroid || config.browser.isiOS )
					twve.tiddler.updateText();
				// Mouse has come to another element.
				feb = twve.tiddler.focusBox();
				var seb = twve.node.box(target);
				if ( feb && feb.contains(seb) ) {
					// If this other element is within the focused one,
					// check if it is a registered editable element.
					twve.tiddler.focusElem(null,'keep');
					tweditable = twve.tiddler.createEditable(target);
					// Yield focus to it if it is.
					if ( tweditable ) {
						twve.tiddler.focus();
						feb = tweditable.differentBox ? null : seb;
					}
					else twve.tiddler.focusElem(focus);
				} else {
					// If this other element is not within the focused
					// one, ask the focused one to leave and yield focus
					// if it agrees or says nothing.
					var leaving = focus.mouseleave
						? focus.mouseleave(ev)
						: true;
					if ( leaving ) {
						twve.tiddler.focus();
						tweditable = twve.tiddler.createEditable(target);
						if ( tweditable )
							feb = tweditable.differentBox ? null : seb;
					}
				}
			}
		} else {
			if ( config.browser.isAndroid || config.browser.isiOS )
				twve.tiddler.updateText();
			// There is currently no focused element.
			tweditable = twve.tiddler.createEditable(target);
		}
		if ( tweditable ) {
			if ( ! tweditable.mouseenter || tweditable.mouseenter(ev) ){
				twve.tiddler.focus(tweditable,'on',ev,feb);
			}
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
			? ev.target
			: null;
	},
//}}}
/***
!!!! twve.tiddler.mouseDown
***/
//{{{
	m_count : 0,
	down_elem : null,
	mouseDown : function (ev) {
		ev = ev || window.event;
		var down_elem = (twve.tiddler.eventTarget(ev));
		if ( down_elem ) {
			var pos = twve.tiddler.mousePosition(ev);
			var focus = twve.tiddler.focusElem();
			if ( focus && focus.is(down_elem) ) {
				var fbox = twve.tiddler.focusBox();
				if (fbox &&
					(pos.x >= fbox.right ||
						pos.y >= fbox.bottom))
					return (twve.tiddler.down_elem = down_elem = null);
			}
			var menu = twve.tiddler.getOptionsMenu();
			if((menu.isVisible() && menu.contains(pos)) ||
				down_elem.nodeName=='A' ||
				twve.node.closest(down_elem,'A')){
				down_elem = null;
				twve.tiddler.m_count = 0;
			} else {
				if ( config.browser.isAndroid || config.browser.isiOS ) {
					if ( twve.tiddler.m_count > 0 ) menu.hide(true);
				} else {
					menu.hide(true);
				}
				if ( down_elem != twve.tiddler.down_elem )
					twve.tiddler.m_count = 0;
			}
		}
		return (twve.tiddler.down_elem = down_elem);
	},
//}}}
/***
!!!! twve.tiddler.mouseUp
***/
//{{{
	mouseUp : function (ev) {
		if ( ! twve.tiddler.down_elem ) return;
		ev = ev || window.event;
		var up_elem = twve.tiddler.eventTarget(ev);
		if ( ! up_elem ) return;
		if ( up_elem == twve.tiddler.down_elem
				&& ! twve.button.isSystemButton(up_elem) ) {
			var edbox = twve.tiddler.getEditBox();
			if ( edbox && twve.node.is(up_elem,edbox) ) {
				//setTimeout(function(){
					twve.tiddler.previewEditBox(up_elem);
				//}, 0);
				return;
			}
			if ( twve.node.closest(up_elem,'.preview')
				|| twve.node.matches(up_elem,'textarea,input') ) {
				return;
			}

			if ( twve.node.matches(
					up_elem,
					'html,#displayArea,#contentWrapper,.txtMainTab' +
					',.header,.headerShadow,.headerForeground' +
					',.siteTitle,.siteSubtitle,#menuBar'
				)
			) {
				twve.tiddler.updateText();
				twve.tiddler.focus();
				return;
			}

			var tweditable = twve.tiddler.focusElem();
			if ( ! tweditable ) return;
			if ( config.browser.isAndroid || config.browser.isiOS ) {
				if ( ++twve.tiddler.m_count < 2 ) return;
				twve.tiddler.m_count = 0;
			}
			if ( edbox ) {
				twve.tiddler.updateTextAndIndex(tweditable);
			}
			if ( tweditable.isEditable(up_elem) ) {
				return ! twve.tiddler.editInPlace(tweditable,ev);
			}
		}
	},
//}}}
/***
!!!! twve.tiddler.resize
***/
//{{{
	resize : function (ev) {
		if ( twve.tiddler.cur_editable ) return;
		if (! (config.browser.isAndroid
				|| config.browser.isiOS
				|| (config.browser.isIE
					&& !config.browser.isIE9))) {
			var twview = twve.viewer.create();
			var selector = twve.viewer.twveSelector();
			var panel = document.querySelectorAll(selector.include);
			for ( var n=0,len=panel.length; n<len; n++ ) {
				twview.setElement(panel[n]);
				twview.refreshSelf();
				twview.clear();
			}
			twve.tiddler.focusElem(null);
			panel = document.querySelectorAll('#sidebar,#mainMenu');
			if ( window.innerWidth < screen.width/2 )
				twve.node.hide(panel);
			else
				twve.node.show(panel);
		}
	},
//}}}
/***
!!!! twve.tiddler.scroll
***/
//{{{
	/*
	scroll : function (ev) {
		if ( twve.tiddler.cur_editable ) {
			var $ed = twve.tiddler.getEditBox();
			if ( ! $ed ) return;
			//var shift = twve.node.positionShift();
			var box = twve.node.box($ed[0]);
			$ed[0].style.left = box.left+'px';
			$ed[0].style.top = box.top+'px';
			var preview = twve.tiddler.getPreviewer();
			if ( preview ) {
				preview.style.left = box.left+'px';
				preview.style.top =
					box.top-preview.offsetHeight;
			}
		}
	},
	*/
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
		// <<foldHeadings>> macro is used: the open sections get folded
		// again. We avoid such situations by calling tiddler.set()
		// instead of store.saveTiddler().
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
		if ( elem && config.options.chktwveCoreEnabled ) {
			var viewer = elem.querySelector('.viewer');
			if ( ! viewer ) viewer = elem;

			twve.viewer.create(viewer).waitAndPrepare();

			// Bind the mousemove event handler to the tiddlerDisplay
			// area. The unbind calls are necessary to prevent multiple
			// invocation upon single event due to multiply bound
			// handler.
			var display = twve.node.closest(
				elem,'div[id=tiddlerDisplay]'
			);
			//if ( config.browser.isAndroid || config.browser.isiOS ) {
				// Nothing to do for mobile devices, yet.
			//} else {
				display.removeEventListener(
					'mousemove', twve.tiddler.mouseMove
				);
				display.addEventListener(
					'mousemove', twve.tiddler.mouseMove
				);
			//}

			// Because FireFox jumps out of the element if text
			// selection is finished with mouse released over another,
			// the click event is not a good place to determine
			// which element to edit. Instead, this plugin compares the
			// element in mousedown and mouseup, and goes to edit
			// function only if they are the same one.

			// The unbind calls are necessary to prevent multiple
			// invocation upon single event due to multiply bound
			// handler.
			/*
			if ( config.browser.isAndroid || config.browser.isiOS ) {
				document.removeEventListener(
					'touchstart', twve.tiddler.mouseDown
				);
				document.addEventListener(
					'touchstart', twve.tiddler.mouseDown
				);
				document.removeEventListener(
					'touchend', twve.tiddler.mouseUp
				);
				document.addEventListener(
					'touchend', twve.tiddler.mouseUp
				);
			} else {
			*/
				document.removeEventListener(
					'mousedown', twve.tiddler.mouseDown
				);
				document.addEventListener(
					'mousedown', twve.tiddler.mouseDown
				);
				document.removeEventListener(
					'mouseup', twve.tiddler.mouseUp
				);
				document.addEventListener(
					'mouseup', twve.tiddler.mouseUp
				);
			//}
			twve.tiddler.getOptionsMenu().hide(true);
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
		twve.wrapper.create(curr.popup).waitAndPrepare();
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
		if(twve.node.closest(tabset,twve.tiddler.displaySelector())) {
			var tabContent = twve.tabContent.create(
				tabset.nextSibling
			);
			tabContent.waitAndPrepare();
			var focus = twve.tiddler.focusElem();
			if ( focus ) {
				twve.tiddler.drawFocusBorders(focus.box());
			}
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
		if(twve.node.closest(wrapper,twve.tiddler.displaySelector())) {
			var ts = twve.tiddlerSpan.create(wrapper);
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
		if(twve.node.closest(place,twve.tiddler.displaySelector())) {
			var sp = twve.sliderPanel.create(
				place.querySelector('div[tiddler]')
			);
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
		//twve.sliderPanel.create(this.nextSibling)
		//	.waitAndPrepare();
	},
//}}}
/***
!!!! twve.tiddler.cur_editable
<<<
The element being edited. Note that this may be different from the element being focused.
<<<
***/
//{{{
	cur_editable : null,
//}}}
/***
!!!! twve.tiddler.edit_box
***/
//{{{
	edit_box : null,
	getEditBox : function(){
		return twve.tiddler.edit_box;
	},
	setEditBox : function(box){
		return (twve.tiddler.edit_box = box);
	},
//}}}
/***
!!!! twve.tiddler.preview
***/
//{{{
	preview : null,
//}}}
/***
!!!! twve.tiddler.getPreviewer
***/
//{{{
	getPreviewer : function(parent){
		if ( ! twve.tiddler.preview ) {
			if ( ! parent )
				parent = twve.tiddler.getDisplay();
			var preview = document.createElement('div');
			twve.tiddler.preview = preview;
			parent.appendChild(preview);
			preview.style.position = 'absolute';
			preview.style.overflow = 'auto';
			preview.style.zIndex = 1;
			preview.style.border = '1px solid black';
			preview.style.padding = 0;
			preview.style.margin = 0;
			preview.style.backgroundColor = '#fff8dc';
			preview.classList.add('preview');
			var board = document.createElement('div');
			preview.appendChild(board);
			board.classList.add(
				'board','viewer','tiddler','selected'
			);
			twve.node.hide(preview);
		}
		return twve.tiddler.preview;
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
		return (ev && (ev.ctrlKey || ev.shiftKey || ev.altKey))
			? false
			: (twelem.tiddler ? twelem.editText(ev) : false);
	},
//}}}
/***
!!!! twve.tiddler.updateText
***/
//{{{
	updateText : function (ta) {
		var editable = twve.tiddler.cur_editable;
		if ( ! ta ) ta = twve.tiddler.getEditBox();
		if ( ! ta || ! editable ) {
			twve.tiddler.closeEditbox();
			twve.tiddler.cur_editable = null;
			return;
		}
		var canceled = false;
		var done = false;
		var modified = false;
		var ctxt = null, txt;
		if ( ta ) {
			ctxt = [];
			for ( var r=0,rlen=ta.length; r<rlen; r++ ){
				if ( ta[r].nodeType ) {
					// single textarea, ctxt[r] shall be its text value
					txt = ta[r].value;
					ctxt[r] = txt;
					if ( ta[r].getAttribute('cancel')=='true' )
						canceled = true;
					if ( ta[r].defaultValue != txt )
						modified = true;
				} else {
					// multiple textareas, ctxt[r] shall be an array
					ctxt[r] = [];
					for(var c=0,clen=ta[r].length; c<clen; c++){
						txt = ta[r][c].value;
						ctxt[r][c] = txt;
						if ( ta[r][c].getAttribute('cancel')=='true' )
							canceled = true;
						if ( ta[r][c].defaultValue != txt )
							modified = true;
					}
				}
			}
		}
		if ( !canceled && modified ) {
			editable.updateText(ctxt);
		}
		twve.tiddler.closeEditbox();
		twve.tiddler.cur_editable = null;
	},
//}}}
/***
!!!! twve.tiddler.updateTextAndIndex
***/
//{{{
	updateTextAndIndex : function(twelem){
		// Update text of the element currently being edited, and the
		// index of the waiting one (twelem).
		var editable = twve.tiddler.cur_editable;
		var pend = editable.end.ndx;
		twve.tiddler.updateText();
		if ( ! twelem ) return;
		var dlen = editable.end.ndx - pend;
		if ( dlen &&
			twve.text.tiddlerTitle(editable.wrapper_title) ==
				twve.text.tiddlerTitle(twelem.wrapper_title) ) {
			// There was change in the text length, indexes of twelem
			// need to be updated.
			if ( editable.dom == twelem.dom ) {
				// Same element, update its end.
				twelem.end.ndx = editable.end.ndx;
			} else if ( twelem.start.ndx > pend ) {
				// Some element after the updated one, update its start
				// and end.
				twelem.start.ndx += dlen;
				twelem.end.ndx += dlen;
			}
		}
	},
//}}}
/***
!!!! twve.tiddler.caretPosition
***/
//{{{
	caretPosition : function(ta, pos_start, pos_end) {
		if ( typeof pos_start == 'undefined' ) {
			// Get caret position
			try {
				if ( document.selection ) {
					// IE
					// The following codes are copied from
					// http://jsfiddle.net/FishBasketGordo/ExZM9/
					ta.focus();
					var sel = document.selection.createRange();
					var sel_copy = sel.duplicate();
					sel_copy.moveToElementText(ta);
					sel_copy.setEndPoint('EndToStart',sel);
					return sel_copy.text.length-sel.text.length;
				} else if ( ta.selectionStart
							|| ta.selectionStart == '0' )
					return ta.selectionStart*1;
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
			if ( ta.setSelectionRange ) {
				ta.focus();
				ta.setSelectionRange(pos_start,pos_end);
			} else if ( ta.createTextRange ) {
				var range = ta.createTextRange();
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
	getSelectionText : function ( ta ) {
		// This function is directly copied from
		// http://stackoverflow.com/questions/3053542/how-to-get-the-start-and-end-points-of-selection-in-text-area
		var s = twve.object.create();
		s.start = 0;
		s.end = 0;
		if (typeof ta.selectionStart == "number"
				&& typeof ta.selectionEnd == "number") {
			// Firefox (and others)
			s.start = ta.selectionStart;
			s.end = ta.selectionEnd;
		} else if (document.selection) {
			// IE
			var bookmark =
				document.selection.createRange().getBookmark();
			var sel = ta.createTextRange();
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
		if ( twve.tiddler.preview )
			twve.node.hide(twve.tiddler.preview);
		var edbox = twve.tiddler.edit_box;
		if ( edbox ) {
			for(var r=0,rlen=edbox.length; r<rlen; r++){
				if ( edbox[r].nodeType )
					// single textarea
					edbox[r].parentNode.removeChild(edbox[r]);
				else
					// array of textareas
					for(var c=0,clen=edbox[r].length; c<clen; c++)
						edbox[r][c].parentNode.removeChild(edbox[r][c]);
			}
			twve.tiddler.edit_box = null;
		}
	},
//}}}
/***
!!!! twve.tiddler.previewEditBox
***/
//{{{
	previewEditBox : function (ta,cpos) {
		var preview = twve.tiddler.getPreviewer();
		if ( ! config.options.chktwveCorePreview ||
			! twve.tiddler.cur_editable ) {
			twve.node.hide(preview);
			return null;
		}
		twve.node.setDimension(preview,ta.offsetWidth);
		if ( typeof cpos != 'number' || cpos == -1 )
			cpos = twve.tiddler.caretPosition(ta);
		var txt = ta.value;
		txt = cpos == 0
			? (config.options.txttwveCorePreviewCaret+txt)
			: (txt.substring(0,cpos)
				+config.options.txttwveCorePreviewCaret
				+txt.substring(cpos));

		twve.node.show(preview);
		var board = preview.querySelector('div.board');

		// The preview contains the font and color attributes of the
		// element being edited. I did not add the next line of code
		// until I found that the color attributes can go wrong in
		// some cases. One example is moving from one table cell with
		// a specific background color to one without, using keyboard
		// navigation.		2013/12/27 Vincent
		twve.node.copyFontColor(board,preview);
		twve.node.wikify(txt,board);
		if ( twve.tiddler.cur_editable.isWrapper() ) {
			var twwrap = twve.tiddler.cur_editable.clone();
			twwrap.dom = board;
			twwrap.waitAndPrepare();
		}

		// Adjust previewer height
		var h = new String(
			config.options.txttwveCorePreviewHeight
		).toLowerCase().trim();
		var lh = twve.node.cssSize(
			window.getComputedStyle(board)
				.getPropertyValue('line-height')
		);
		if ( /\D$/.test(h) )
			// txttwveCorePreviewHeight contains non-digits at
			// its end
			h = twve.node.cssSize(h);
		else
			// txttwveCorePreviewHeight is all digits
			h = lh*h;
		var bh = board.offsetHeight+lh;
		if ( bh > h ) bh = h;
		var tpos = twve.node.box(ta);
		if ( bh > tpos.top ) {
			bh = tpos.top;
			tpos.top = 0;
		} else
			tpos.top -= bh;
		twve.node.setPosition(preview,tpos.left,tpos.top-2);
		// Add 1 in height to avoid unnecessary scrollbar.
		twve.node.setDimension(preview,null,bh+1);
		return preview
	},
//}}}
/***
!!!! twve.tiddler.getPreviewedNodes
***/
//{{{
	getPreviewedNodes : function(txt){
		var preview = twve.tiddler.getPreviewer();
		if ( twve.node.isVisible(preview) )
			//return preview.querySelector('div.board').childNodes;
			return twve.node.wikify(txt);

		// Previewer is hidden, show it, wikify into it, and return.
		twve.node.show(preview);
		var nodes = twve.node.wikify(txt);
		twve.node.hide(preview);
		return nodes;
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
	updateCaretPosition : function(ta,force){
		var cpos = twve.tiddler.caretPosition(ta);
		if ( force || cpos != twve.tiddler.caret_pos.cur ) {
			twve.tiddler.previewEditBox(ta,cpos);
		}
		twve.tiddler.caret_pos.last = twve.tiddler.caret_pos.cur;
		twve.tiddler.caret_pos.cur = cpos;
	},
//}}}
/***
!!!! twve.tiddler.keydownAfter
***/
//{{{
	keydownAfter : function (ev,ta) {
		if ( ev.which == 27 ) {
			ta.setAttribute('cancel', 'true');
			twve.tiddler.updateText();
			return false;
		}
		if ( ! twve.tiddler.cur_editable ) return false;

		var force = false;
		switch ( ev.which ) {
			case 46 : // delete
				force = true;
			case 8 : // backspace
				if ( ev.alterKey ) return false;
				//twve.tiddler.updateCaretPosition(ta,force);
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
				//twve.tiddler.updateCaretPosition(ta,force);
				break;
			default :
				// Adjust the edit box height to fit its containing
				// text.

				// It is interesting that with Chrome, FireFox,
				// and Safari we need to change the height of ta
				// to get the correct scrollHeight, while with IE9
				// we get it no matter what. The scrH0 is the minimum
				// height that we stored upon initialization.
				var tah = Math.round(twve.node.height(ta));
				twve.node.setDimension(ta,null,0);
				var scrH0 = ta.getAttribute('scrH0')*1;
				var scrH = ta.scrollHeight;
				scrH = Math.max(scrH, scrH0);
				twve.node.setDimension(ta,null,scrH);
				//twve.tiddler.previewEditBox(ta);
				break;
		}
		twve.tiddler.updateCaretPosition(ta,force);
		return true;
	},
//}}}
/***
!!!! twve.tiddler.keydown
***/
//{{{
	keydown : function (ev) {
		ev = ev || window.event;
		var ta = this;
		var editable = twve.tiddler.cur_editable;
		switch ( ev.which ) {
			case 13 :
				if ( editable.multiLine(ta.value) ) {
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
					twve.tiddler.keydownAfter(ev,ta);
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
	textPasted : function(ta){
		var txt = ta.value;
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
			var ta = this;
			twve.tiddler.text_before_paste = ta.value;
			twve.tiddler.selection_at_paste =
				twve.tiddler.getSelectionText(ta);
			setTimeout(function() {
				if ( twve.tiddler.cur_editable.pasteIn )
					twve.tiddler.cur_editable.pasteIn(ta);
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
		var ta = this;
		//setTimeout(function() {
			if ( twve.tiddler.cur_editable.copyOrCut )
				twve.tiddler.cur_editable.copyOrCut(ta,cut);
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
!!!! twve.tiddler.closeTiddler
***/
//{{{
	precloseTiddler : null,
	closeTiddler : function () {
		twve.tiddler.updateText();
		twve.tiddler.focus();
		return twve.tiddler.precloseTiddler.apply(this,arguments);
	},
//}}}
/***
!!!! twve.tiddler.saveHandler
***/
//{{{
	preSaveHandler : null,
	saving : false,
	saveHandler : function(){
		twve.tiddler.saving = true;
		var result = twve.tiddler.preSaveHandler.apply(this,arguments);
		twve.tiddler.saving = false;
		return result;
	},
//}}}
/***
!!!! twve.tiddler.cancelHandler
***/
//{{{
	preCancelHandler : null,
	cancelHandler : function (ev,src,title) {
		if(store.isDirty()) {
			if(!confirm(this.warning.format([title])))
				return false;
		}
		return twve.tiddler.preCancelHandler.apply(this,arguments);
	},
//}}}
/***
!!!! twve.tiddler.saveChanges
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
			} else if ( src.dom ) {
				// src is a twve.element object
				sel.include = src.selector.include;
				sel.exclude = src.selector.exclude;
				return sel;
			}
			// Otherwise src is expected to be a DOM node.
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
		if ( ! node ) return node;
		if ( node.nodeType ) return node.nodeName;
		var len = node.length;
		var msg = '('+len+')[';
		--len;
		for ( var i=0; i<len; i++ ) {
			msg += node[i].nodeName+', ';
		}
		return msg + node[len].nodeName + ']';
	},
//}}}
/***
!!!! twve.node.matches
***/
//{{{
	matches : function(node,selector){
		if ( ! node || ! selector ) return false;
		if ( ! node.nodeType ) {
			// Multiple nodes, such as a NodeList.
			for ( var i=0,len=node.length; i<len; i++ )
				if ( twve.node.matches(node[i],selector) )
					return true;
			return false;
		}

		// Tests if a DOM node matches the selector.
		var matches = node.matches || node.mozMatchesSelector ||
			node.webkitMatchesSelector || node.msMatchesSelector ||
			node.oMatchesSelector;
		if ( matches ) return matches.call(node,selector);

		// None of the above functions are supported, use the parent's
		// querySelectorAll to test.
		if ( ! node.parentNode ) return false;
		var siblings=node.parentNode.querySelectorAll(selector);
		if ( ! siblings.length ) return false;
		for ( var i=0, n=siblings.length; i<n; i++ )
			if ( siblings[i] == node ) return true;
		return false;
	},
//}}}
/***
!!!! twve.node.closest
***/
//{{{
	closest : function(node,selector){
		while ( node ) {
			if ( twve.node.matches(node,selector) )
				return node;
			node = node.parentNode;
		}
		return null;
	},
//}}}
/***
!!!! twve.node.parents
***/
//{{{
	parents : function(node,selector,filter){
		// Collects all parents of node that matches selector or filtered
		// by filter function.
		var parents = [];
		node = node.parentNode;
		while ( node ) {
			if ( ! selector || twve.node.matches(node,selector) )
				if ( ! filter || filter.call(node) )
					parents[parents.length] = node;
			node = node.parentNode;
		}
		return parents.length ? parents : null;
	},
//}}}
/***
!!!! twve.node.is
***/
//{{{
	is : function(node,criteria){
		if ( ! node || ! criteria ) return false;
		if ( typeof criteria == 'string' ) {
			return twve.node.matches(node,criteria);
		}
		if ( node.nodeType ) {
			// node is a single DOM node
			if ( criteria.nodeType ) {
				// criteria is a single DOM node
				return node == criteria;
			} else {
				// criteria is a collection of DOM nodes
				for ( var i=0,len=criteria.length; i<len; i++ )
					if ( twve.node.is(node,criteria[i]) ) return true;
			}
		} else {
			// node is a collection of DOM nodes
			if ( criteria.nodeType ) {
				// criteria is a single DOM node
				for ( var i=0,len=node.length; i<len; i++ )
					if ( twve.node.is(node[i],criteria) ) return true;
			} else {
				// criteria is a collection of DOM nodes
				for ( var i=0,len=node.length; i<len; i++ )
					for ( var j=0,len=criteria.length; j<len; j++ )
						if ( twve.node.is(node[i],criteria[j]) )
							return true;
			}
		}
		return false;
	},
//}}}
/***
!!!! twve.node.not
***/
//{{{
	not : function(nodes,toremove){
		// Remove some of the nodes out of an array of nodes.
		// The 1st argument, nodes, is an array of nodes, while the 2nd
		// argument can be one of the followings:
		//		1. a CSS string;
		//		2. an array of nodes or a NodeList;
		//		3. a single DOM node.
		if ( typeof toremove == 'string' ) {
			// The 2nd argument is a CSS string.
			var i = 0;
			while ( i < nodes.length )
				if ( twve.node.matches(nodes[i],toremove) )
					nodes.splice(i,1);
				else i++;
			return nodes;
		}
		// The 2nd argument is either a DOM node or an array of DOM
		// nodes (or a NodeList).
		if ( toremove.nodeType ) {
			// The 2nd argument is a DOM node.
			var p = nodes.indexOf(toremove);
			if ( p > -1 ) nodes.splice(p,1);
		} else {
			// The 2nd argument is an array of DOM nodes or a NodeList.
			for ( var i=0,len=toremove.length; i<len; i++ ) {
				var p = nodes.indexOf(toremove[i]);
				if ( p > -1 ) nodes.splice(p,1);
			}
		}
		return nodes;
	},
//}}}
/***
!!!! twve.node.replace
***/
//{{{
	replace : function(newnode,oldnode,parent){
		if ( ! parent ) parent = oldnode.parentNode;
		if ( newnode.nodeType ) {
			// single node
			parent.insertBefore(newnode,oldnode);
		} else {
			// multiple nodes
			// In the following codes we keep inserting the first
			// node, instead of newnode[i], into the parent, because
			// the insertBefore() function removes the inserted node
			// out of the NodeList newnode.
			while( newnode.length ) {
				parent.insertBefore(newnode[0],oldnode);
			}
		}
		parent.removeChild(oldnode);
	},
//}}}
/***
!!!! twve.node.scrollBarWidth
***/
//{{{
	scw : 0,
	scrollBarWidth : function(node){
		if ( ! twve.node.scw ) {
			if ( ! node ) return 0;
			var of = node.style.overflow;
			node.style.overflow = 'scroll';
			twve.node.scw = node.offsetWidth-node.clientWidth;
			node.style.overflow = of;
		}
		return twve.node.scw;
	},
//}}}
/***
!!!! twve.node.adjustPosition
***/
//{{{
	adjustPosition : function(pos){
		// If the displayArea does not have position:static CSS style,
		// the offset positions are incorrectly shifted. Need to correct
		// it here.
		var display = twve.tiddler.getDisplay();
		if ( window.getComputedStyle(display)
				.getPropertyValue('position') != 'static' ) {
			if ( pos.left !== undefined ) {
				pos.left -= display.offsetLeft;
				pos.top -= display.offsetTop;
			} else {
				pos.x -= display.offsetLeft;
				pos.y -= display.offsetTop;
			}
		}
		return pos;
	},
//}}}
/***
!!!! twve.node.shiftPosition
***/
//{{{
	shiftPosition : function(node,left,top){
		if ( left === undefined ) return;
		var topmissing = top === undefined || top === null;
		var postL = (typeof left == 'number'?'px':'');
		var postT = (typeof top == 'number'?'px':'');
		if ( node.nodeType ) {
			// single node
			if ( left !== null )
				node.style.left = node.offsetLeft+left+postL;
			if ( ! topmissing )
				node.style.top = node.offsetTop+top+postT;
		} else {
			// multiple node
			for ( var i=0,len=node.length; i<len; i++ ) {
				if ( left !== null )
					node[i].style.left = node[i].offsetLeft+left+postL;
				if ( ! topmissing )
					node[i].style.top = node[i].offsetTop+top+postT;
			}
		}
	},
//}}}
/***
!!!! twve.node.setPosition
***/
//{{{
	setPosition : function(node,left,top){
		if ( left === undefined ) return;
		var topmissing = top === undefined || top === null;
		var postL = (typeof left == 'number'?'px':'');
		var postT = (typeof top == 'number'?'px':'');
		if ( node.nodeType ) {
			// single node
			if ( left !== null )
				node.style.left = left+postL;
			if ( ! topmissing )
				node.style.top = top+postT;
		} else {
			// multiple node
			for ( var i=0,len=node.length; i<len; i++ ) {
				if ( left !== null )
					node[i].style.left = left+postL;
				if ( ! topmissing )
					node[i].style.top = top+postT;
			}
		}
	},
//}}}
/***
!!!! twve.node.setDimension
***/
//{{{
	setDimension : function(node,w,h){
		if ( w === undefined ) return;
		var hmissing = h === undefined || h === null;
		var postW = (typeof w == 'number'?'px':'');
		var postH = (typeof h == 'number'?'px':'');
		if ( node.nodeType ) {
			// single node
			if ( w !== null )
				node.style.width = w+postW;
			if ( ! hmissing )
				node.style.height = h+postH;
		} else {
			// multiple nodes
			for(var i=0,len=node.length; i<len; i++){
				if ( w !== null )
					node[i].style.width = w+postW;
				if ( ! hmissing )
					node[i].style.height = h+postH;
			}
		}
	},
//}}}
/***
!!!! twve.node.positionShift
***/
//{{{
	positionShift : function(){
		// ---------------------------------------------------------
		// The following few lines of codes are directly copied from
		// http://javascript.info/tutorial/coordinates
		var body = document.body;
		var docElem = document.documentElement;
		var scrollTop =
			window.pageYOffset ||
			docElem.scrollTop ||
			body.scrollTop;
		var scrollLeft =
			window.pageXOffset ||
			docElem.scrollLeft ||
			body.scrollLeft;
		var clientTop =
			docElem.clientTop ||
			body.clientTop ||
			0;
		var clientLeft =
			docElem.clientLeft ||
			body.clientLeft ||
			0;
		// ---------------------------------------------------------
		return twve.node.adjustPosition(
			{
				left: (scrollLeft - clientLeft),
				top: (scrollTop - clientTop)
			}
		);
	},
//}}}
/***
!!!! twve.node.boxInit
***/
//{{{
	boxInit : function(src,shift,dest,method){
		dest.top = src.top;
		dest.right = src.right;
		dest.bottom = src.bottom;
		dest.left = src.left;
		// shift
		dest.shift = function(shift){
			// Shift this box by an amount specified in shift.
			dest.top += shift.top;
			dest.right += shift.left;
			dest.bottom += shift.top;
			dest.left += shift.left;
			return dest;
		};
		if ( shift ) dest.shift(shift);
		if ( method === false ) return dest;
		// toString
		dest.toString = function(){
			return twve.object.toString(dest);
		};
		// containsX
		dest.containsX = function(x){
			return x >= dest.left && x <= dest.right;
		};
		// containsY
		dest.containsY = function(y){
			return y >= dest.top && y <= dest.bottom;
		};
		// contains
		dest.contains = function(pos){
			if ( pos.left )
				// The pos should be a box object.
				return dest.containsX(pos.left) &&
					dest.containsX(pos.right) &&
					dest.containsY(pos.top) &&
					dest.containsY(pos.bottom);
			else
				// The pos should be a mouse position object.
				return dest.containsX(pos.x) &&
					dest.containsY(pos.y);
		};
		// cloneTo
		dest.cloneTo = function(newdest,n,method){
			var src = typeof n == 'number'
				? dest[n]
				: dest;
			twve.node.boxInit(src,null,newdest,method);
			newdest.width = src.width;
			newdest.height = src.height;
			return newdest;
		};
		return dest;
	},
//}}}
/***
!!!! twve.node.box
***/
//{{{
	box : function(node,outerw,outerh) {
		if ( ! node ) return null;
		var box = null;
		if (node.nodeType == 3) {
			var r = document.createRange();
			r.selectNodeContents(node);
			box = r.getClientRects();
			r.detach();
		} else {
			if (twve.node.matches(
				node,
				//twve.tiddler.wrapperSelectors().include
				twve.tiddler.twveTranscludedSelectors().include
			)) {
				box = [];
				box[0] = {};
				box[0].left = node.offsetLeft;
				box[0].top = node.offsetTop;
				box[0].width = node.offsetWidth;
				box[0].height = node.offsetHeight;
				box[0].right = node.offsetLeft+box[0].width;
				box[0].bottom = node.offsetTop+box[0].height;
			} else if ( node.getClientRects ) {
				if ( ! twve.node.isVisible(node) ) return null;
				box = node.getClientRects();
			} else {
				box = [];
				box[0] = {};
				box[0].left = node.screenX;
				box[0].top = node.screenY;
				box[0].width = node.innerWidth;
				box[0].height = node.innerHeight;
				box[0].right = node.screenX+box[0].width;
				box[0].bottom = node.screenY+box[0].height;
			}
		}
//}}}
/***
!!!!! box.initFrom
***/
//{{{
		box.initFrom = function(src,shift,dest,method){
			return twve.node.boxInit(src,shift,(dest || box),method);
		};
//}}}
/***
!!!!! finding the shift, boundingRect, and clientRects
***/
//{{{
		// Find the position shift.
		var shift = twve.node.positionShift();
		// Obtain the outer-most box.
		if ( node.getBoundingClientRect ) {
			// If the browser provides it, take it.
			box.initFrom(node.getBoundingClientRect(),shift);
			// Calculate the width and height of the outer-most box.
			if ( ! outerw ) {
				box.width = node.clientWidth || node.offsetWidth;
				box.right = box.left + box.width;
			} else {
				box.width = box.right - box.left;
			}
			if ( ! outerh ) {
				box.height = node.clientHeight || node.offsetHeight;
				box.bottom = box.top + box.height;
			} else {
				box.height = box.bottom - box.top;
			}
		} else {
			if ( ! box[0] ) return null;
			// Otherwise we construct it ourselves.
			box.initFrom(box[0]);
			for ( var n = 1; n < box.length; n++ ) {
				if ( box[n].left < box.left )
					box.left = box[n].left;
				if ( box[n].right > box.right )
					box.right = box[n].right;
				if ( box[n].bottom > box.bottom )
					box.bottom = box[n].bottom;
			}
			box.width = box.right - box.left;
			box.height = box.bottom - box.top;
			box.shift(shift);
		}
//}}}
/***
!!!!! End of box.
***/
//{{{
		return box;
	},
//}}}
/***
!!!! twve.node.cssSize
***/
//{{{
	cssSize : function (txt, node) {
		if ( ! txt ) {
			if ( ! node ) return 0;
			return parseFloat(
				//node.style.fontSize ||
				window.getComputedStyle(node)
					.getPropertyValue('font-size')
			);
		}

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

				if ( isNaN(size) ) {
					var css = null;
					try {
						css = window.getComputedStyle(node);
					} catch(err) {
						node = twve.tiddler.getDisplay();
						css = window.getComputedStyle(node);
					} finally {
						return css
							?	twve.node.cssSize(
									css.getPropertyValue(txt),node
								)
							: 0;
					}
				}

				if ( unit == 'em' ) {
					return Math.round(
						size*parseFloat(
							window.getComputedStyle(node)
								.getPropertyValue(
									'font-size'
								)
							//e.style.fontSize
						)*16/12
					);
				}
				if (unit.charAt(1)=='%') {
					return Math.round(
						size/100*twve.node.width(node,'inner')
					);
				}

				return size;
		}
	},
//}}}
/***
!!!! twve.node.bgc
***/
//{{{
	bgc : function (e,style) {
		// Returns the background color of a node e
		if ( ! style ) style = window.getComputedStyle(e);
		var bgc;
		while ( (bgc=style.getPropertyValue(
					'background-color'
				))=='transparent'
				|| bgc == 'rgba(0, 0, 0, 0)'
				|| bgc == 'inherit' ) {
			e = e.parentNode;
			if ( ! e ) {
				bgc = '#fff';
				break;
			}
		}
		return bgc;
	},
//}}}
/***
!!!! twve.node.copyFontColor
***/
//{{{
	copyFontColor : function (dest, src, va) {
		if ( ! dest || ! src ) return;
		var srcstyle = window.getComputedStyle(src);
		//var deststyle = window.getComputedStyle(dest);
		if ( ! va ) va = srcstyle.getPropertyValue('vertical-align');
		var bkc = srcstyle.getPropertyValue('background-color');
		switch ( bkc ) {
			case 'transparent' :
			case 'rgba(0, 0, 0, 0)' :
			case 'inherit' :
				bkc = twve.node.bgc(src,srcstyle);
			default :
				dest.style.backgroundColor = bkc;
				break;
		}
		dest.style.fontSize=srcstyle.getPropertyValue('font-size');
		dest.style.fontFamily=srcstyle.getPropertyValue('font-family');
		dest.style.fontStyle=srcstyle.getPropertyValue('font-style');
		dest.style.color=srcstyle.getPropertyValue('color');
		dest.style.textAlign=srcstyle.getPropertyValue('text-align');
		dest.style.verticalAlign=va;
	},
//}}}
/***
!!!! twve.node.wikify
***/
//{{{
	wikify : function ( txt, node ) {
		// Wikifies txt into node if given, or into a newly created
		// node if not. Returns the node being wikified.
		if(! node) {
			var board = twve.tiddler.getPreviewer()
				.querySelector('div.board');
			board.innerHTML = '';
			wikify(txt, board);
			node = board.childNodes;
		} else {
			node.innerHTML = '';
			wikify(txt,node);
		}
		return node;
	},
//}}}
/***
!!!! twve.node.isVisible
***/
//{{{
	isVisible : function(node){
		if ( ! node ) return false;
		if ( node.nodeType == 3 ) return true;
		return node.style
			? node.style.display != 'none'
			: true;
	},
//}}}
/***
!!!! twve.node.hide
***/
//{{{
	hide : function(node){
		if ( ! node ) return;
		if ( twve.object.isCollection(node) )
			for ( var i=0,len=node.length; i<len; i++) {
				node[i].style.display = 'none';
				//node[i].style.visibility = 'hidden';
			}
		else
			node.style.display = 'none';
		//else
		//	node.style.visibility = 'hidden';
	},
//}}}
/***
!!!! twve.node.show
***/
//{{{
	show : function(node,start,len){
		if ( ! node ) return;
		if ( twve.object.isCollection(node) ) {
			if ( typeof len != 'number' || len > node.length )
				len = node.length;
			if ( typeof start != 'number' || start < 0 )
				start = 0;
			for ( var i=start; i<len; i++ ) {
				node[i].style.display = '';
				//node[i].style.visibility = 'visible';
			}
		} else
			node.style.display = '';
			//node.style.visibility = 'visible';
	},
//}}}
/***
!!!! twve.node.getMargin
***/
//{{{
	getMargin : function(node,which){
		// Get the margin width of node. The 2nd argument which can be
		// one of the followings:
		//	1. one of 'left', 'top', 'right', and 'bottom'.
		//	2. 'horizontal' -- sum of 'left' and 'right' margins.
		//	3. 'vertical' -- sum of 'top' and 'bottom' margins.
		var css = window.getComputedStyle(node);
		var m1, m2;
		switch ( which.charAt(0) ) {
			case 'h' :
			case 'H' : // horizontal = left + right
				m1 = node.style.marginLeft ||
					css.getPropertyValue('margin-left');
				m1 = m1 ? parseInt(m1) : 0;
				m2 = node.style.marginRight ||
					css.getPropertyValue('margin-right');
				m2 = m2 ? parseInt(m2) : 0;
				return m1 + m2;
			case 'v' :
			case 'V' : // vertical = top + bottom
				m1 = node.style.marginTop ||
					css.getPropertyValue('margin-top');
				m1 = m1 ? parseInt(m1) : 0;
				m2 = node.style.marginBottom ||
					css.getPropertyValue('margin-bottom');
				m2 = m2 ? parseInt(m2) : 0;
				return m1 + m2;
			case 'l' :
			case 'L' : // left
				m1 = node.style.marginLeft ||
					css.getPropertyValue('margin-left');
				return m1 ? parseInt(m1) : 0;
				break;
			case 't' :
			case 'T' : // top
				m1 = node.style.marginTop ||
					css.getPropertyValue('margin-top');
				return m1 ? parseInt(m1) : 0;
				break;
			case 'r' :
			case 'R' : // right
				m2 = node.style.marginRight ||
					css.getPropertyValue('margin-right');
				return m2 ? parseInt(m2) : 0;
				break;
			case 'b' :
			case 'B' : // bottom
				m2 = node.style.marginBottom ||
					css.getPropertyValue('margin-bottom');
				return m2 ? parseInt(m2) : 0;
				break;
		}
		return 0;
	},
//}}}
/***
!!!! twve.node.getPadding
***/
//{{{
	getPadding : function(node,which){
		// Get the padding width of node. The 2nd argument which can be
		// one of the followings:
		//	1. one of 'left', 'top', 'right', and 'bottom'.
		//	2. 'horizontal' -- sum of 'left' and 'right' paddings.
		//	3. 'vertical' -- sum of 'top' and 'bottom' paddings.
		var css = window.getComputedStyle(node);
		var m1, m2;
		switch ( which.charAt(0) ) {
			case 'h' :
			case 'H' : // horizontal = left + right
				m1 = node.style.paddingLeft ||
					css.getPropertyValue('padding-left');
				m1 = m1 ? parseInt(m1) : 0;
				m2 = node.style.paddingRight ||
					css.getPropertyValue('padding-right');
				m2 = m2 ? parseInt(m2) : 0;
				return m1 + m2;
			case 'v' :
			case 'V' : // vertical = top + bottom
				m1 = node.style.paddingTop ||
					css.getPropertyValue('padding-top');
				m1 = m1 ? parseInt(m1) : 0;
				m2 = node.style.paddingBottom ||
					css.getPropertyValue('padding-bottom');
				m2 = m2 ? parseInt(m2) : 0;
				return m1 + m2;
			case 'l' :
			case 'L' : // left
				m1 = node.style.paddingLeft ||
					css.getPropertyValue('padding-left');
				return m1 ? parseInt(m1) : 0;
				break;
			case 't' :
			case 'T' : // top
				m1 = node.style.paddingTop ||
					css.getPropertyValue('padding-top');
				return m1 ? parseInt(m1) : 0;
				break;
			case 'r' :
			case 'R' : // right
				m2 = node.style.paddingRight ||
					css.getPropertyValue('padding-right');
				return m2 ? parseInt(m2) : 0;
				break;
			case 'b' :
			case 'B' : // bottom
				m2 = node.style.paddingBottom ||
					css.getPropertyValue('padding-bottom');
				return m2 ? parseInt(m2) : 0;
				break;
		}
		return 0;
	},
//}}}
/***
!!!! twve.node.width
***/
//{{{
	width : function(node,which,margin){
		// Returns the width of the 1st argument node. The 2nd argument
		// specifies 'inner', 'normal', or 'outer' width to return.
		// The 'normal' width (default) is the clientWidth, the 'inner'
		// width is the clientWidth less the left- and right- paddings,
		// while the 'outer' is the offsetWidth.
		// The 3rd argument, margin, is a boolean value telling this
		// function whether to include the left and right margins.
		// It is effective only when retrieving the 'outer' width.

		// If the 2nd argument is omitted, 'normal' width is returned.
		var w = 0;
		var outer = /^out/i.test(which);
		var hidden = ! twve.node.isVisible(node);
		if ( hidden ) twve.node.show(node);
		if ( outer ) {
			// outer width
			w = node.offsetWidth;
			if ( margin )
				w += twve.node.getMargin(node,'horizontal');
		} else {
			w = node.clientWidth;
			if ( /^inn/i.test(which) )
				// inner width
				w -= twve.node.getPadding(node,'horizontal');
		}
		if ( hidden ) twve.node.hide(node);
		return w;
	},
//}}}
/***
!!!! twve.node.height
***/
//{{{
	height : function(node,which,margin){
		// Returns the height of the 1st argument node. The 2nd argument
		// specifies 'inner', 'normal', or 'outer' height to return.
		// The 'normal' height (default) is the clientHeight, the 'inner'
		// height is the clientHeight less the top- and bottom-paddings,
		// while the 'outer' height is the offsetHeight.
		// The 3rd argument, margin, is a boolean value telling this
		// function whether to include the top and bottom margins. It is
		// effective only when retrieving the 'outer' height.

		// If the 2nd argument is omitted, 'normal' height is returned.
		var h = 0;
		var outer = /^out/i.test(which);
		var hidden = ! twve.node.isVisible(node);
		if ( hidden ) twve.node.show(node);
		if ( outer ) {
			h = node.offsetHeight;
			if ( margin )
				h += twve.node.getMargin(node,'vertical');
		} else {
			h = node.clientHeight;
			if ( /^inn/i.test(which) )
				// inner height
				h -= twve.node.getPadding(node,'vertical');
		}
		if ( hidden ) twve.node.hide(node);
		return h;
	},
//}}}
/***
!!!! twve.node.contains
***/
//{{{
	contains : function(w0,w1,how){
		// Tests if w0 contains w1, hierarchically or geometrically.
		// The first two arguments, w0 and w1, are both DOM nodes.
		// The last argument, how, is a string specifying how to do
		// the test. If it is given 'geo', or any string starting with
		// 'geo', the test is done geometrically, i.e., the function
		// returns true if the bounding rect of w0 contains that of w1,
		// regardless of their hierarchical relation in the DOM tree.
		// If, however, the last argument is given any other string or
		// left undefined, the function returns true if w0 is one of
		// the parents of w1 in the DOM tree.
		if ( /^geo/i.test(how) ) {
			// Geometrical test.
			var box = twve.node.box(w0,true,true);
			if ( ! box ) return false;
			if ( w1.x ) {
				// Tests if w0 contains a position w1
				return box ? box.contains(w1) : false;
			}
			// Tests if w0 contains another twve node or DOM node
			if ( w1.dom ) w1 = w1.dom;
			return box.contains(twve.node.box(w1));
		} else {
			// Hierarchical test.
			while ( (w1 = w1.parentNode) )
				if ( w0 == w1 ) return true;
			return false;
		}
	},
//}}}
/***
!!!! twve.node.index
***/
//{{{
	index : function(node){
		// Return the index of node within its siblings.
		var siblings = node.parentNode.childNodes;
		for ( var i=0,len=siblings.length; i<len; i++ )
			if ( siblings[i] == node ) return i;
		return -1;
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
			node.dom = null;
			return node;
		};
		// copy from
		node.copyFrom = function(obj){
			node.dom = obj.dom;
			return node;
		};
		// is
		node.is = function(criteria){
			return criteria && criteria.dom
				? node.dom == criteria.dom
				: twve.node.is(node.dom,criteria);
		};
		// not
		node.not = function(toremove){
			return twve.node.not(node.dom,toremove);
		};
		// hide
		node.hide = function(){
			twve.node.hide(node.dom);
			return node;
		};
		// show
		node.show = function(pos){
			twve.node.show(node.dom);
			if ( pos )
				twve.node.setPosition(node.dom,pos.left,pos.top);
			return node;
		};
		// isVisible
		node.isVisible = function(){
			return twve.node.isVisible(node.dom);
		};
		// width
		node.width = function(which,margin){
			return twve.node.width(node.dom,which,margin);
		};
		// height
		node.height = function(){
			return twve.node.height(node.dom);
		};
		// get element
		node.getElement = function(){
			return node.dom;
		};
		// box
		node.box = function(){
			return twve.node.box(node.getElement());
		};
		// contains
		node.contains = function(elem,how){
			return twve.node.contains(node.dom,elem,how);
		};
		// add
		node.add = function(newnode){
			if ( node.dom.nodeType ) node.dom = [node.dom];
			node.dom[node.dom.length] = (newnode.dom || newnode);
			return node;
		};
		// creation codes
		node.clear();
		switch ( typeof src ) {
			case 'string' :
				node.dom = document.createElement(src);
				break;
			case 'object' :
				if ( src.dom )
					node.copyFrom(src);
				else if ( src.nodeName )
					node.dom = src;
				break;
		}
		// End of node
		return node;
	}
};
//}}}
/***
!!! twve.nodeList
***/
//{{{
twve.nodeList = {
//}}}
/***
!!!! twve.nodeList.toArray
***/
//{{{
	toArray : function(node){
		// The following lines of codes are copied from the reply posted
		// by Thai in
		// http://stackoverflow.com/questions/3199588/fastest-way-to-convert-javascript-nodelist-to-array
		var twnodelist = [];
		if ( node.nodeType )
			// Single node
			twnodelist[0] = node;
		else
			// Multiple nodes
			for (var i=0,len=twnodelist.length=node.length;i<len;i++)
				twnodelist[i] = node[i];
		return twnodelist;
	},
//}}}
/***
!!!! twve.nodeList.querySelectorAll
***/
//{{{
	querySelectorAll : function(parent,selector){
		if ( parent.nodeType ) {
			// Single parent
			return twve.nodeList.toArray(
				parent.querySelectorAll(selector)
			);
		}
		// Multiple parent
		var w = null;
		for (var i=0,len=parent.length; i<len; i++) {
			var w1 = twve.nodeList.toArray(
				parent[i].querySelectorAll(selector)
			);
			w = w ? w.concat(w1) : w1;
		}
		return w;
	}
};
//}}}
/***
!!! twve.button
***/
//{{{
twve.button = {
	isSystemButton : function (elem) {
		return twve.node.matches(
			elem,
			'svg.SVGAnimatedString, path.SVGAnimatedString'
		);
	},
//}}}
/***
!!!! twve.button.isActive
***/
//{{{
	isActive : function ( btn ) {
		var opacity = btn.style
			? btn.style.opacity
			: window.getComputedStyle(btn)
				.getPropertyValue('opacity');
		return opacity == '1';
	},
//}}}
/***
!!!! twve.button.activate
***/
//{{{
	activate : function ( btn, tf ) {
		return btn.style.opacity = (tf?1:0.4);
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
			return twve.button.isActive(btn);
		};
		// activate
		btn.activate = function(tf){
			return twve.button.activate(btn.dom,tf);
		};
		// creation codes
		btn.dom.setAttribute('id','twveTbtn'+(id?id:label));
		btn.dom.style.position = 'absolute';
		btn.dom.style.zIndex = 1;
		btn.dom.style.textAlign = 'center';
		btn.dom.addEventListener(
			'mouseenter',
			function(ev){
				if ( btn.mouseenter )
					btn.mouseenter.call(this,ev || window.event);
			}
		);
		btn.dom.addEventListener(
			'mouseleave',
			function(ev){
				if ( btn.mouseleave )
					btn.mouseleave.call(this,ev || window.event);
			}
		);
		btn.dom.addEventListener(
			'click',
			function(ev){
				if ( btn.click )
					btn.click.call(this,ev || window.event);
			}
		);
		// end of btn
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
			if ( ! menu.items ) menu.items = [];
			var item = twve.button.create(
				createTiddlyElement(menu.dom,'li'),
				null,
				tooltip
			);
			item.dom.style.whiteSpace = 'nowrap';
			item.label = label;
			twve.node.wikify(label,item.dom);
			item.mouseenter = function(){
				var pos = twve.object.create();
				pos.left = item.dom.offsetLeft + menu.dom.offsetLeft;
				pos.top = item.dom.offsetTop + menu.dom.offsetTop;
				if ( item.submenu ) {
					item.submenu.show(pos,'left');
				}
			};
			item.mouseleave = function(ev){
				var pos = twve.tiddler.mousePosition(ev);
				if ( item.submenu
					&& ! item.submenu.contains(pos) )
					item.submenu.hide();
			};
			menu.items[menu.items.length] = item;
			menu.dom.removeAttribute('adjusted');
			return item;
		};
		// addMenu
		menu.addMenu = function(label,handler){
			var item = menu.findItem(label);
			if ( ! item )
				item = menu.addItem(label);
			if ( ! item.submenu ) {
				item.submenu = twve.menu.create(item,true);
				if ( handler )
					handler.call(this,item.submenu.dom);
			}
			return item.submenu;
		};
		// contains
		var preContains = menu.contains;
		menu.contains = function(pos){
			if ( preContains.call(this,pos,'geo') )
				return true;
			if ( menu.items )
				for (var i=menu.items.length-1; i>=0; i--)
					if ( menu.items[i].submenu
						&& menu.items[i].submenu.contains(pos,'geo') )
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
			twve.node.hide(menu.dom);
			return menu;
		};
		// adjustPosition
		menu.adjustPosition = function(pos,where,w,h,ref){
			if ( ! ref ) ref = menu;
			if ( ! w ) w = ref.width('outer',true);
			if ( /left/i.test(where) ) pos.left -= w;
			if ( ! h ) h = ref.height('outer',true);
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
			menu.adjustPosition(menupos,where,null,null,menu.root);
			menu.root.show(menupos);
			return menupos;
		};
		// adjustDim
		menu.adjustDim = function(){
			if ( menu.items ) {
				var w = 0;
				var h = 0;
				for ( var i=0; i<menu.items.length; i++ ){
					var iw = twve.node.width(
						menu.items[i].dom,'outer',true
					);
					if ( iw > w ) w = iw;
					twve.node.setPosition(menu.items[i].dom,null,h);
					h += twve.node.height(
						menu.items[i].dom,'outer',true
					);
				}
				twve.node.setDimension(
					menu.dom,w,
					h + (config.browser.isOpera ||
							config.browser.isChrome
						? twve.node.scrollBarWidth(menu.dom)-4
						: 0)
				);
			}
			menu.dom.setAttribute('adjusted','true');
			return menu;
		};
		// show
		menu.show = function(pos,where){
			twve.node.show(menu.dom);
			if ( ! menu.dom.getAttribute('adjusted') ) {
				menu.adjustDim();
			}
			var w = menu.width('outer',true);
			if ( pos ) {
				var menupos = twve.object.create();
				menupos.left = pos.left+4;
				menupos.top = pos.top;
				if ( w > pos.left ) {
					// Left side is too narrow to put the menu, check
					// the right side.
					var rw = menu.root.width('outer',true);
					var right = twve.node.box(window).width;
					if ( w+rw+menupos.left < right ) {
						// Right side is enough, put it there.
						where = 'right';
						menupos.left += rw-4;
					} else {
						// Right side is also not enough, put it in the
						// larger side.
						if ( right - w > pos.left ) {
							// Right side is larger
							twve.node.setDimension(
								menu.dom,(w = right - w)
							);
							where = 'right';
							menupos.left += rw-4;
						} else {
							// Left side is larger
							twve.node.setDimension(
								menu.dom,(w = pos.left)
							);
						}
					}
				}
				var h = twve.node.cssSize(
					//menu.dom.style.fontSize
					window.getComputedStyle(menu.dom)
						.getPropertyValue('font-size')
				)*20;
				if ( menu.height('outer',true) > h )
					twve.node.setDimension(menu.dom,null,h);
				menu.adjustPosition(menupos,where,w,h);
				twve.node.setPosition(
					menu.dom,menupos.left,menupos.top
				);
			}
			return menu;
		};
		// begin of initialization
		var parent = twve.tiddler.getDisplay();
		if ( ! root.mouseenter ) {
			// root.mouseenter
			root.mouseenter = function(){
				var pos = twve.object.create();
				pos.left = this.offsetLeft;
				pos.top = this.offsetTop;
				menu.show(pos,'left');
				return menu;
			};
			// root.click
			root.click = function(){
				menu.show();
				return menu;
			};
			parent.appendChild(root.dom);
		}
		menu.root = root;
		parent.appendChild(menu.dom);
		menu.dom.style.overflow = 'auto';
		menu.dom.style.position = 'absolute';
		menu.dom.classList.add('popup');
		menu.hide();
		if ( autohide )
			menu.dom.addEventListener(
				'mouseleave',
				function(){twve.node.hide(this);}
			);
		else
			menu.dom.addEventListener(
				'mouseleave',
				function(ev){
					if ( menu.mouseleave )
						menu.mouseleave.call(this,ev || window.event);
				}
			);
		// end of menu
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
			// Array of DOm object representing all the wrappers
			// related to this element, each of the wrappers contains
			// one of the copies of this element. See twve.wrapper for
			// details of the system wrappers.
			editable.wrapper = null;
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
			editable.wrapper = editablex.wrapper;
			editable.start.copyFrom(editablex.start);
			editable.end.copyFrom(editablex.end);
			return editable;
		};
		// created
		editable.created = function(src){
			editable.clear();
			return src
				? src.dom
					? editable.copyFrom(src)
					: editable.setElement(src)
				: editable;
		};
		// isEditable
		editable.isEditable = function(elem){
			return editable.is(elem)
				|| editable.contains(elem);
		};
		// beingEdited
		editable.beingEdited = function(){
			return editable.is(twve.tiddler.cur_editable);
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
		editable.twveSelector = function(selector,which){
			return twve.tiddler.twveSelector(
				editable.dom,selector,which
			);
		};
		// is wrapper?
		editable.isWrapper = function(){
			return false;
		};
		// folded wrapper
		editable.foldedWrapper = function(){
			var twwrap = editable.directWrapper();
			return twwrap.isVisible()
				? null
				: twwrap;
		};
		// direct wrapper
		editable.directWrapper = function(){
			// Find the direct wrapper of the editable from the
			// registered wrappers.
			// See twve.tiddler.registerWrapper() for a list of system
			// wrappers.
			return twve.tiddler.directWrapper(editable.dom,true);
		};
		// isSystemShadow
		editable.isSystemShadow = function(){
			/*
			if ( editable.wrapper_title ) {
				if ( ! editable.tiddler )
					editable.tiddler = twve.tiddler.get(
						editable.wrapper_title
					);
				return (! editable.tiddler);
			}
			return true;
			*/
			return editable.wrapper_title
				? store.isShadowTiddler(editable.wrapper_title)
				: true;
		};
		// findWrappers
		editable.findWrappers = function(){
			if ( ! editable.wrapper ) {
				editable.wrapper = twve.tiddler.wrapperFromTitle(
					editable.wrapper_title
				);
			}
			return editable.wrapper;
		};
//}}}
/***
!!!!! editable.setElement
***/
//{{{
		editable.setElement = function (elem) {
			// Sets element elem (DOM node) to this twve.editable
			// object.
			// If elem is already set before, this method returns null
			// (meaning no further process is needed). Otherwise it
			// returns this editable itself.

			if ( elem == editable.dom ) return null;

			editable.dom = elem;
			if ( ! editable.directWrapper() ) return editable;
			// Find the wrapper title if not yet.
			if( ! editable.wrapper_title ) {
				var dw = editable.directWrapper();
				if ( dw && dw.titleOfWrapper )
					editable.wrapper_title = dw.titleOfWrapper();
			}
			// Find tiddler and all copies of wrappers if not
			// a shadow tiddler
			if ( editable.isSystemShadow() ) {
				editable.tiddler = null;
				editable.wrapper = null;
				editable.wrapper_title = null;
			} else {
				if ( ! editable.tiddler ) {
					editable.tiddler = twve.tiddler.get(
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
!!!!! editable.ensureValid
***/
//{{{
		editable.ensureValid = function(ndx){
			if ( ndx <= 0 ) return 0;
			var max = editable.tiddler.text.length;
			return ndx >= max ? max : ndx;
		};
//}}}
/***
!!!!! editable.checkNewLines
***/
//{{{
		editable.checkNewLines = function (txt,open,close) {
			editable.newline_open = txt.charAt(open) == '\n';
			editable.newline_close = close > (open+1) &&
				txt.charAt(close-1) == '\n';
		};
//}}}
/***
!!!!! editable.setText
***/
//{{{
		editable.setText = function (newtxt,open,close) {
			var txt = editable.tiddler.text;
			if ( typeof open != 'number' ) open = editable.start.ndx;
			if ( typeof close != 'number' ) close = editable.end.ndx;
			open = editable.ensureValid(open);
			close = editable.ensureValid(close);

			var dlen = 0;
			editable.checkNewLines(txt,open,close);
			if ( ! newtxt ) {
				if ( editable.newline_open && editable.newline_close )
					// If we are removing a piece of text, and that piece of
					// text contains more than one newline symbols, forward
					// the open index to keep one of them (the opening one).
					open++;
				// The user wants to remove the existing text.
				txt = txt.substring(0,open) + txt.substring(close);
				// change in length of text
				dlen = -(close-open);
			} else {
				// Set the wiki text of this editable object.
				// If the current text contains a leading newline, move the
				// opening index forward by one to exclude it.
				if ( editable.newline_open ) open++;
				// If the current text contains an ending newline, move the
				// closing index backward by one to exclude it.
				if ( editable.newline_close ) close--;
				dlen = newtxt.length - (close-open);
				txt = txt.substring(0,open)
					+ newtxt
					+ txt.substring(close);
			}
			// update the ending index of the direct wrapper if
			// desired.
			var dw = editable.directWrapper();
			if ( dw != editable )
				dw.end.ndx += dlen;
			// update the ending index of this editable.
			editable.end.ndx += dlen;
			// update tiddler text
			twve.tiddler.saveText(editable,txt);
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
			if ( open >= close ) return '';
			var txt = editable.tiddler.text;
			editable.checkNewLines(txt,open,close);
			// If the current text contains a leading newline, move the
			// opening index forward by one to exclude it.
			if ( editable.newline_open ) open++;
			// If the current text contains an ending newline, move the
			// closing index backward by one to exclude it.
			if ( editable.newline_close ) close--;
			// Get the wiki text of this editable object.
			return txt.substring(open,close);
		};
//}}}
/***
!!!!! editable.focusEditBox
***/
//{{{
		editable.focusEditBox = function(ta,txt){
			if ( txt ) ta.select();
			else ta.focus();
			twve.tiddler.initCaretPos();
			return editable;
		};
//}}}
/***
!!!!! editable.prepareEditBox
***/
//{{{
		editable.prepareEditBox = function(ta,txt,eb,talign,fs){
			ta.style.position = 'absolute';
			ta.style.padding = '0';
			ta.style.margin = '0';
			ta.style.overflow = 'auto';
			ta.style.textAlign = talign;
			ta.style.fontFamily = 'courier';
			ta.style.fontSize = fs+'px';
			twve.node.setPosition(ta,eb.left-1,eb.top-1);
			twve.node.setDimension(ta,eb.width,eb.height);
			ta.setAttribute('scrH0',eb.height);
			ta.setAttribute('spellcheck','true');
			ta.setAttribute('cancel','false');
			ta.setAttribute(
				'title',
				'('+(editable.multiLine(txt)
					?'Ctrl-'
					:'')+'ENTER=accept, ESC=cancel)'
			);
			ta.addEventListener(
				'keydown',
				twve.tiddler.keydown
			);
			ta.addEventListener(
				'paste',
				twve.tiddler.paste
			);
			ta.addEventListener(
				'copy',
				function(){
					twve.tiddler.copyOrCut();
				}
			);
			ta.addEventListener(
				'cut',
				function(){
					twve.tiddler.copyOrCut(true);
				}
			);
		};
//}}}
/***
!!!!! editable.previewEditBox
***/
//{{{
		editable.previewEditBox = function(ta,elem,display){
			var preview = twve.tiddler.getPreviewer(display);
			// Copy font attributes
			twve.node.copyFontColor(preview,elem);
			// Output to previewer
			//setTimeout(function(){
				twve.tiddler.previewEditBox(ta,null);
			//},0);
			return preview;
		};
//}}}
/***
!!!!! editable.editText
***/
//{{{
		editable.editText = function(ev,txt,elem) {
			if ( ! elem ) elem = editable.getElement();
			twve.tiddler.cur_editable = editable;
			if ( txt === undefined ) txt = editable.getText();
			var ta = document.createElement('textarea');
			ta.value = txt;
			ta.defaultValue = txt;
			var css = window.getComputedStyle(elem);
			var lh = twve.node.cssSize(
				css.getPropertyValue('line-height')
			);
			var fs = twve.node.cssSize(
				css.getPropertyValue('font-size')
			);
			var eb = twve.tiddler.focusBox() ||
				editable.box('edit',ev,elem);
			if ( eb.height < lh ) eb.height = lh;

			var display = twve.node.closest(
				elem,
				twve.tiddler.displaySelector()
			);
			display.appendChild(ta);
			editable.prepareEditBox(
				ta,txt,eb,css.getPropertyValue('text-align'),fs
			);
			twve.node.setDimension(ta,null,0);
			var scrH = ta.scrollHeight;
			if ( scrH < eb.height ) scrH = eb.height;
			else eb.height = scrH;
			twve.node.setDimension(ta,null,scrH);

			twve.tiddler.setEditBox([ta]);
			editable.focusEditBox(ta,txt,ev,elem);
			editable.previewEditBox(ta,elem,display);

			var minw = fs*config.options.txttwveCoreMinEditWidth;
			twve.node.setDimension(
				ta,(eb.width < minw ? minw : eb.width)
			);
			return ta;
		};
//}}}
/***
!!!!! editable.hasClass
***/
//{{{
		editable.hasClass = function ( cstr ) {
			return editable.dom.classList.contains(cstr);
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
			// direct wrapper of the dom
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
		twelem.markupTags = function(){
			return twve.tiddler.markupTags(twelem.dom);
		};
		// direct wrapper
		var preDirectWrapper = twelem.directWrapper;
		twelem.directWrapper = function () {
			// Find the direct wrapper of this element if not yet.
			if ( ! twelem.direct_wrapper )
				twelem.direct_wrapper =
					preDirectWrapper.apply(this,arguments);
			// Return the direct wrapper.
			return twelem.direct_wrapper;
		};
//}}}
/***
!!!!! twelem.renderedCopy
***/
//{{{
		twelem.renderedCopy = function(w) {
			// Find the rendered copy of this twelem in the
			// wrapper w (DOM node).

			var dw = twelem.directWrapper();
			if ( ! dw ) return null;
			dw = dw.dom;
			if ( dw == w ) {
				// Searching in the direct wrapper, the rendered copy
				// is just this twve.element object.
				return twelem;
			}
			if ( twve.node.contains(w,dw) ) {
				// The wrapper w contains the direct wrapper, meaning
				// it's the case of self-inclusion or folded section,
				// exclude it.
				return null;
			}

			// We are searching a transcluded copy of this twelem.
			// If neither of this twelem or that copy to be searched in w
			// is transcluded (non-transcluded or normally transcluded),
			// their rendering index shall be the same and there is no need
			// to re-find it. If, however, either one of the two is partially
			// transcluded, their rendering indexes are not the same
			// in general, we need to re-find it in w.
			var rndx = -1;
			if ( twve.text.tiddlerSection(twelem.wrapper_title)
				||	twve.text.tiddlerSection(
						twve.tiddler.titleOfWrapper(w)
					)
			) {
				// One of the copies is partially transcluded.
				// Clear the rendering index (by setting twelem.rIndex to -1)
				// so the twve.wrapper.renderedElement() function will
				// re-find it.
				rndx = twelem.rIndex;
				twelem.rIndex = -1;
			}
			var the_copy = twve.wrapper.renderedElement(twelem,w);
			if ( rndx > -1 )
				// We had cleared the rendering index of this object
				// to re-find it in w. Restore it here.
				twelem.rIndex = rndx;
			return the_copy;
		};
//}}}
/***
!!!!! twelem.removeSelf
***/
//{{{
		twelem.removeSelf = function(){
			twelem.dom.parentNode.removeChild(twelem.dom);
			twve.tiddler.focusElem(null);
			return twelem;
		};
//}}}
/***
!!!!! twelem.replaceWith
***/
//{{{
		twelem.replaceWith = function(newnode,oldnode){
			twve.node.replace(newnode,(oldnode||twelem.dom));
			return twelem;
		};
//}}}
/***
!!!!! twelem.filter
***/
//{{{
		twelem.filter = function(node,selector){
			if ( ! selector )
				selector = twelem.twveSelector(null,'rendering').include;
			if ( node.nodeType )
				return twve.node.matches(node,selector) ? node : null;
			var filtered = [];
			for ( var i=0,len=node.length; i<len; i++ )
				if(twve.node.matches(node[i],selector))
					filtered[filtered.length] = node[i];
			if ( filtered.length == 0 ) return null;
			return filtered.length > 1 ? filtered : filtered[0];
		};
//}}}
/***
!!!!! twelem.refreshSelf
***/
//{{{
		twelem.refreshSelf = function(txt){
			// Refresh the element itself by creating a new copy and
			// replace this one. This method refreshes only one copy of
			// the element and nothing more. It is normally called
			// within twelem.refreshAll(), which takes care of
			// transclusion synchronization.

			// Parameters:
			//		txt:	See twelem.refreshAll below.
			var nodes = twve.tiddler.getPreviewedNodes(txt);
			var elem = twelem.filter(nodes) || nodes[0];
			twelem.replaceWith(nodes);
			twelem.dIndex = -1;
			twelem.setElement(elem);
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
			var folded = null;
			var animated = config.options.chkAnimate;
			config.options.chkAnimate = false;
			var sec = twve.text.tiddlerSection(
				twelem.wrapper_title
			);
			if ( typeof txt != 'string' ) {
				txt = twelem.getText();
			}
			twelem.findWrappers();
			for (var n=0,len=twelem.wrapper.length; n<len; n++) {
				var w = twelem.wrapper[n];
				var w_title = twve.tiddler.titleOfWrapper(w);
				var w_sec = twve.text.tiddlerSection(w_title);
				if ( sec && w_sec && w_sec != sec ) {
					// We are refreshing only one section in the
					// tiddler, but this wrapper contains another
					// section different from the one to refresh.
					// Do nothing.
					continue;
				}
				var twcopy = twelem.renderedCopy(w);
				if ( ! twcopy ) {
					// There is no such element in this wrapper.
					// Check for slices
					if ( ! w_sec ) {
						w_sec = twve.text.tiddlerSlice(w_title);
						if ( w_sec ) {
							// Yes, its a transcluded slice, refresh it.
							twcopy=twve.tiddler.createEditableWrapper(w);
							if ( twcopy ) twcopy.refreshSelf(w_sec);
						}
					}
					continue;
				}
				folded = twcopy.foldedWrapper();
				if ( folded )
					// unfold it to refresh the element
					twve.node.show(folded.dom);
				if ( txt ) {
					// Otherwise refresh the element
					twcopy.refreshSelf(txt);
					if ( param && param.what )
						twcopy.changed(param);
				} else
					// Text is empty, meaning this element should be
					// removed
					twcopy.removeSelf(param);
				// Done refreshing
				if ( folded )
					// fold it back
					twve.node.hide(folded.dom);
			}
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
				var elems = twelem.directWrapper().findElements(
					twelem.twveSelector(null,'rendered')
				);
				if ( elems ) {
					twelem.rIndex = elems.indexOf(twelem.dom);
				}
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
			//		2.	return true.
			// Otherwise,
			//		1.	return false.
			// See the counts method in twve.table or twve.blockquote
			// for examples.
			searchInfo.remained--;
			searchInfo.ndx++;
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
			// this one (twelem.dom).
			searchInfo.remained = twelem.rIndex > -1
				? (twelem.rIndex+1)
				: (twelem.dIndex > -1 ? (twelem.dIndex+1) : 1);
			// Index number (order of appearance) of the element
			// represented by this twve.element object.
			// If the rendering index (twelem.rIndex) was -1 upon
			// calling this function, its value would be set to
			// count.ndx upon returning. Same thing would be done to
			// the defining index (twelem.dIndex) if it was -1 upon
			// calling.
			searchInfo.ndx = -1;
			var inactiveTags = twve.tags.inactiveTags();
			// Do the searching
			do {
				twelem.start = twelem.tags.nextOpenTag(
					txt,twelem.start,inactiveTags
				);
				if ( twelem.start.ndx < 0 ) {
					// Opening tag not found, returns the negative of
					// the remaining number of elements to be skipped.
					twelem.start.ndx = -searchInfo.remained;
					return twelem.start;
				}
				// Make sure this element is not an inactive element,
				// such as within a preformatted or a code block.
				/*
				var end = inactiveTags.encloses(txt,twelem.start.ndx);
				if ( end ) {
					twelem.start.ndx = end.ndx + end.matched.length;
					continue;
				}
				*/
				// Check if this one counts.
				if ( ! twelem.counts(searchInfo,txt) ) {
					twelem.start.ndx += twelem.start.matched.length;
					continue;
				}

//if(twve.MathJax.displayed.is(twelem.dom))console.log('remaining '+searchInfo.remained+' this is ['+txt.substring(twelem.start.ndx,twelem.start.ndx+40)+']');
				if ( searchInfo.remained == 0 ) {
					// Found the wiki text of the element.
					if ( twelem.dIndex == -1 )
						twelem.dIndex = searchInfo.ndx;
					if ( twelem.rIndex == -1 )
						twelem.rIndex = searchInfo.ndx;
					return twelem.start;
				}
				// Otherwise keep searching.
				twelem.start.ndx = twelem.ends(null,txt,inactiveTags).ndx;
			} while (true);
		};
//}}}
/***
!!!!! twelem.ends
***/
//{{{
		twelem.ends = function (start,txt,inactiveTags) {
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
			// Move the starting position to skip the remaining of the
			// opening tag.
			//start.ndx += start.matched.length;
			start.ndx++;

			if (! txt) txt = twelem.tiddler.text;
			var tags = twelem.tags.exactCloseTag(start.matched);

			twelem.end.copyFrom(
				tags.matchedCloseTag(txt,start,txt.length,inactiveTags)
			);
			if ( twelem.end.ndx == -1 ) {
				twelem.end.ndx = txt.length;
			} else {
				twelem.end.ndx += twelem.end.matched.length;
			}
			return twelem.end;
		};
//}}}
/***
!!!!! twelem.setElement
***/
//{{{
		var preSetElement = twelem.setElement;
		twelem.setElement = function (elem,txt) {
			// Sets element elem (DOM node) to this twve.element object.
			if ( ! elem ) return twelem.clear();
			if ( typeof elem == 'string' ) {
				twelem.dom = elem;
				twelem.tags = twve.tiddler.markupTags(elem);
			} else {
				if ( ! preSetElement.apply(this,arguments) )
					// Same element, no need to do anything.
					return twelem;
				if ( ! twelem.tiddler )
					// Shadowed or non-existing tiddler
					return twelem;

				// An element. Look for its rendering index
				// if necessary.
				if ( twelem.rIndex < 0 && twelem.dIndex < 0 )
					twelem.renderingIndex();
				// Find its corresponding wiki tags if necessary.
				if ( ! twelem.tags )
					// Find its corresponding wiki tags.
					twelem.tags = twelem.markupTags();
				// Search for the beginning of element wiki text.
				var start = txt ? twve.position.create() : null;
				twelem.starts(start,txt);
				/*
				if ( twelem.start.ndx<0 && twelem.htmlTags ) {
					// If not found, search for HTML text
					twelem.tags = twelem.htmlTags(true);
					twelem.starts(start,txt);
				}
				*/
				if ( twelem.start.ndx >= 0 ) {
					// If the beginning is found, search for
					// the end.
					twelem.ends(null,txt);
				} else {
					// Otherwise set the end position to -1.
					twelem.end.ndx = -1;
				}
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
	twveSelector : function(selector,which){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		var inc = 'pre,div.syntaxhighlighter';
		if ( !/^render/i.test(which) )
			inc += ',div.alt1,div.alt2'+
				',.syntaxhighlighter code'+
				',.syntaxhighlighter table';
		selector.includeSelector(inc);
		return selector;
	},
//}}}
/***
!!!! twve.pre.markupTags
***/
//{{{
	markupTags : function(){
		var tags = twve.tags.create(
			['\n{{{', '\n\/\/{{{', '\n\/\*{{{\*\/', '\n<!--{{{-->'],
			['}}}\n', '\/\/}}}\n', '\/\*}}}*\/\n', '<!--}}}-->\n']
		);
		// blockElement
		tags.blockElement = true;
		// clone
		tags.clone = function(){
			// Optional, may save a tiny bit of time.
			return twve.pre.markupTags();
		};
		return tags;
	},
//}}}
/***
!!!! twve.pre.create
***/
//{{{
	create : function(src){
		var pre = twve.element.create();
		// markupTags
		pre.markupTags = function(){
			// Optional, may save a tiny bit of time.
			return twve.pre.markupTags();
		};
		// clone
		pre.clone = function(){
			// Optional, may save a tiny bit of time.
			return twve.pre.create(pre);
		};
		// twveSelector
		pre.twveSelector = function(selector,which){
			// Optional, may save a tiny bit of time.
			return twve.pre.twveSelector(selector,which);
		};
		// setElement
		var preSetElement = pre.setElement;
		pre.setElement = function(elem){
			if ( ! twve.node.matches(elem,'pre') )
				elem = twve.node.closest(elem,'div.syntaxhighlighter');
			return preSetElement.call(this,elem);
		};
		return pre.created(src);
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
!!!! twve.code.markupTags
***/
//{{{
	markupTags : function(){
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
		var code = twve.element.create();
		// markupTags
		code.markupTags = function(){
			// Optional, may save a tiny bit of time.
			return twve.code.markupTags();
		};
		// clone
		code.clone = function(){
			// Optional, may save a tiny bit of time.
			return twve.code.create(code);
		};
		// twveSelector
		code.twveSelector = function(){
			// Optional, may save a tiny bit of time.
			return twve.code.twveSelector();
		};
		// counts
		code.counts = function(searchInfo,txt){
			if(txt.charAt(code.start.ndx+code.start.matched.length) != '\n'){
				searchInfo.remained--;
				searchInfo.ndx++;
				return true;
			}
			return false;
		};
		return code.created(src);
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
	getLevel : function(txt,start,ch){
		var level = 0;
		if ( ! ch ) {
			ch = txt.charAt(start);
			if ( ! ch || /\s/.test(ch) ) {
				return 0;
			}
			level++;
		} else if ( /\s/.test(ch) ) {
			return 0;
		}
		var len = txt.length;
		while ( (start+level)<len &&
			ch.indexOf(txt.charAt(start+level))>-1 )
			level++;
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
				var ndx = start.ndx;
				if (txt.charAt(ndx)=='\n') ndx++;
				elem.level = twve.leveledElement.getLevel(txt,ndx);
			}
			return elem.level;
		};
//}}}
/***
!!!!! elem.getOpenTag
***/
//{{{
		elem.getOpenTag = function(start,txt) {
			// Get the actual opening tag
			if ( ! txt ) txt = elem.tiddler ? elem.tiddler.text : '';
			if ( ! txt ) return '';
			if ( ! start ) start = elem.start;
			var level = elem.getLevel(txt,start);
			var tag = '';
			if ( txt.charAt(start.ndx) == '\n' ) level++;
			else tag = '\n';
			return tag + txt.substring(start.ndx,(start.ndx+level));
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
			if ( elem.start.ndx > -1 )
				elem.start.matched = elem.getOpenTag(elem.start,txt);
			return elem.start;
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
					(/^render/i.test(which)
						? ''
						: ','+twve.heading.getSpanSelector()))
		);
		return selector;
	},
//}}}
/***
!!!! twve.heading.markupTags
***/
//{{{
	markupTags : function(){
		var tags = twve.tags.create(
			'\n!',
			'\n'
		);
		// blockElement
		tags.blockElement = true;
		return tags;
	},
//}}}
/***
!!!! twve.heading.getTitle
***/
//{{{
	getTitle : function(h,title_only){
		// Returns the title (content) of a header.

		var hnode = null;
		if ( h.dom ) {
			// h is a twve.heading object
			hnode = h.dom;
		} else {
			// h has to be a DOM node
			hnode = h;
			h = null;
		}
		if ( ! hnode ) return null;
		if ( hnode.childNodes.length > 0 ){
			// If a header contains formatted text or even transcluded
			// content, the rendered text will be different from the
			// defining wiki text and cause this plugin a failure in
			// finding the section content. In such cases we return
			// directly the defining wiki text instead of the rendered
			// text.
			var twh = twve.heading.create(h);
			twh.setElement(hnode);
			return twve.text.sectionTitle(twh.getText());
		} else {
			var title = hnode.textContent;
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
				var twh = twve.heading.create(h);
				twh.setElement(hnode);
				var hs = twh.directWrapper().findElements(
					twve.heading.twveSelector(null,'rendered')
				);
				if ( hs ) {
					var hndx = hs.indexOf(hnode);
					var hoccur = 0;
					for ( var n = 0; n < hndx; n++ ) {
						var hprev = hs[n];
						var tprev = twve.heading.getTitle(hprev,true);
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
		var focus = twve.tiddler.focusElem();
		if ( ! focus || ! focus.is(this) ||
				(focus.indexOf && focus.indexOf(this) == -1) ) {
			twve.heading.preClick.apply(this,arguments);
		}
	},
//}}}
/***
!!!! twve.heading.prepareElement
***/
//{{{
	prepareElements : function(twwrap){
		if ( config.options.chktwveCoreEnabled &&
			! twwrap.isSystemShadow() ) {
			var foldable = twwrap.dom.querySelectorAll(
				twve.heading.twveSelector(null,'foldable').include
			);
			for (var i=0,len=foldable.length; i<len; i++){
				if ( ! twve.heading.preClick )
					twve.heading.preClick = foldable[i].onclick;
				foldable[i].onclick = twve.heading.click;
			}
			return twwrap;
		}
		return null;
	},
//}}}
/***
!!!! twve.heading.create
***/
//{{{
	create : function(src){
		// Create an instance of twve.heading object.
		// The argument src can be one of the followings:
		//		1. a twve.heading object
		//		2. a jQeury object representing a header
		//		3. a DOM object (a header)
		var h = twve.leveledElement.create();
		// twveSelector
		h.twveSelector = function(selector,which){
			return twve.heading.twveSelector(selector,which);
		};
		// markupTags
		h.markupTags = function(){
			return twve.heading.markupTags();
		};
		// get title
		h.getTitle = function (title_only) {
			return twve.heading.getTitle(h,title_only);
		};
		// set element
		var preSetElement = h.setElement;
		h.setElement = function(elem){
			preSetElement.call(
				this,
				twve.node.matches(elem,twve.heading.getSpanSelector())
					? elem.parentNode
					: elem
			);
			return h;
		};
		// mouseenter
		h.mouseenter = function(ev){
			var selector = twve.heading.getSpanSelector();
			var sp = h.dom.querySelector(selector);
			return ! sp
				? true
				: twve.node.matches(ev.target,selector);
		};
		// mousemove
		h.mousemove = function(ev){
			if ( ! h.mouseenter(ev) ) {
				twve.tiddler.focus();
			}
		};
		// is
		h.is = function(elem){
			return twve.node.is(
				h.dom,
				twve.node.matches(elem,twve.heading.getSpanSelector())
					? elem.parentNode
					: elem
			);
		};
		// isEditable
		h.isEditable = function(elem){
			var selector = twve.heading.getSpanSelector();
			return twve.node.matches(elem,selector)
				? true
				: h.dom.querySelectorAll(selector).length == 0;
		};

		return h.created(src);
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
	recordFoldable : function(foldable){
		var folded = null;
		if ( foldable ) {
			folded = [];
			for ( var i=0,len=foldable.length; i<len; i++ ) {
				folded[i] = ! twve.node.isVisible(foldable[i]);
			}
		}
		return folded;
	},
//}}}
/***
!!!! twve.wrapper.restoreFoldable
***/
//{{{
	restoreFoldable : function(foldable,folded){
		if ( foldable ) {
			// Temporarily disable animation
			var animated = config.options.chkAnimate;
			config.options.chkAnimate = false;
			var imax = folded
				? Math.min(folded.length, foldable.length)
				: foldable.length;
			for ( var i = 0; i < imax; i++ ) {
				if (
					foldable[i] &&
					(! folded ||
						(folded[i]&&twve.node.isVisible(foldable[i])) ||
						(!folded[i]&&!twve.node.isVisible(foldable[i]))) &&
					foldable[i].previousSibling
				) {
					var ev = document.createEvent('MouseEvent');
					ev.initEvent('click',true,true);
					foldable[i].previousSibling.dispatchEvent(ev);
				}
			}
			config.options.chkAnimate = animated;
		}
	},
//}}}
/***
!!!! twve.wrapper.renderedElement
<<<
* This function finds a rendered copy of twelem in wrapper w.
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
	renderedElement : function (twelem,w,cyclic) {
		//	Arguments:
		//		twelem:	A twve.element object representing the element
		//				to look for.
		//		w:	The wrapper in which to find the element. If
		//			omitted, the search will be done within
		//			twelem.directWrapper().
		//		cyclic: Search in a cyclic manner.
		if ( ! twelem ) return null;
		if ( twelem.rIndex < 0 && twelem.dIndex < 0 && ! cyclic ) {
			return null;
		}
		if ( ! w ) w = twelem.directWrapper().dom;
		// Make sure there are such kind of elements in the wrapper.
		var elements = twve.wrapper.findElements(
			w, twelem.twveSelector(null,'rendered')
		);
		// If no such elements contained in the wrapper, return null.
		if ( ! elements ) return null;

		var size = elements.length;
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
				newelem.wrapper = w;
				newelem.direct_wrapper =
					twve.tiddler.createEditableWrapper(w,true);
				newelem.wrapper_title =
					newelem.direct_wrapper.wrapper_title;

				// Find the element. The rendering index will be
				// determined in newelem.starts() function.
				newelem.starts();
				if ( newelem.rIndex >= 0 ) {
					newelem.ends();
					newelem.dom = elements[newelem.rIndex];
					return newelem;
				}
				return null;
			} else if ( newelem.rIndex >= size ) {
				// This wrapper does not contain a rendered copy of
				// twelem.
				return null;
			}
		}

		var elem = elements[newelem.rIndex];
		if ( newelem.dIndex < 0 ) {
			newelem.setElement(elem);
		} else {
			newelem.dom = elem;
		}
		if ( newelem.direct_wrapper.dom != w ) {
			newelem.wrapper = w;
			newelem.direct_wrapper =
				twve.tiddler.createEditableWrapper(w,true);
			newelem.wrapper_title =
				newelem.direct_wrapper.wrapper_title;
		}
		return newelem;
	},
//}}}
/***
!!!! twve.wrapper.findElements
***/
//{{{
	findElements : function (w, selector) {
		// Find all the rendered elements in wrapper w that are
		// specified by selector. The 2nd argument can be either
		// a string (valid CSS selector), or an object containing
		// the following information:
		//	{
		//		include: CSS selector to include
		//		exclude: CSS selector to exclude
		//	}

		if ( ! w || ! selector ) return null;

		if (typeof selector == 'string' ) {
			selector = twve.selector.create(selector,'');
		} else if ( ! selector.include ) {
			// The 2nd argument is not a valid selector object.
			return null;
		}

		var elems = twve.nodeList.toArray(
			w.querySelectorAll(selector.include)
		);

		// In wrapper w there could be transcluded tiddlers,
		// which may contain elements of the same type. We shall
		// remove them because they are not defined in the tiddler
		// directly related to wrapper w.

		var t_selector = twve.tiddler.twveTranscludedSelectors();
		var t_wrapper = w.querySelectorAll(t_selector.include);
		for ( var i=0,len=t_wrapper.length; i<len; i++ ) {
			elems = twve.node.not(
				elems,
				t_wrapper[i].querySelectorAll(selector.include)
			);
		}

		if ( selector.exclude ) {
			elems = twve.node.not(elems,selector.exclude);
		}

		return elems.length > 0 ? elems : null;
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
			return twve.tiddler.titleOfWrapper(twwrap.dom);
		};
		// isEditable
		twwrap.isEditable = function(elem){
			return twwrap.dom == elem
				? true
				: twve.node.contains(twwrap.dom,elem) &&
					! twve.node.matches(
						elem,
						twve.heading.twveSelector().include
					);
		};
		// findElements
		twwrap.findElements = function(selector){
			return twve.wrapper.findElements(
				twwrap.dom,
				selector || twwrap.twveSelector(null,'rendered')
			);
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
			twh.tags = twve.heading.markupTags();
			while ( to_skip >= 0 ) {
				twh.starts(twh.end);
				if ( twh.start.ndx == -1 ) break;
				twh.ends();
				var title = twve.text.sectionTitle(twh.getText());
				if ( title.substring(0,sec.length)==sec ) {
					to_skip--;
				}
			}
			twwrap.start.ndx = twh.end.ndx;
			return twwrap.start;
		};
		// ends
		twwrap.ends = function(){
			var sec = twve.text.tiddlerSection(twwrap.wrapper_title);
			if ( sec ) {
				var twh = twve.heading.create();
				twh.dIndex = 0;
				twh.tiddler = twwrap.tiddler;
				twh.tags = twve.heading.markupTags();
				twh.start.ndx = twwrap.start.ndx;
				twh.starts(twh.start);
				if ( twh.start.ndx < 0 )
					twwrap.end.ndx = twwrap.tiddler.text.length;
				else twwrap.end.ndx = twh.start.ndx;
			} else
				twwrap.end.ndx = twwrap.tiddler.text.length;
			return twwrap.end;
		};
		// set element
		var preSetElement = twwrap.setElement;
		twwrap.setElement = function (elem) {
			// Sets element elem (DOM node) to this twve.wrapper object.
			if ( ! elem ) return twwrap.clear();
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
		// refresh self
		twwrap.refreshSelf = function(sec,txt){
			if ( ! twwrap.tiddler ) return twwrap;

			// Refresh only one wrapper, assuming open and visible.
			// If sec is null or undefined, this method refreshes
			// the whole wrapper. If sec is given, it should be the
			// section title associated with this wrapper, and
			// this method refreshes that section only.
			// Record the status of folded wrappers
			// if suitable.

			// Even though this wrapper is open and visible, there
			// might be foldable wrappers (created using <<slider>> or
			// <<foldHeadings>>) contained in this one. If so, we record
			// their folding status, refresh this wrapper, then restore
			// their folding status.

			// Record folding status, if there are foldable wrappers.
			var selector = twve.tiddler.twveFoldableSelector();
			var foldable = twwrap.findElements(selector);
			var folded = twve.wrapper.recordFoldable(foldable);
			if ( ! txt )
				txt = sec ? twwrap.getText('refresh') : twwrap.tiddler.text;
			// Refresh this wrapper
			// First remove all the child nodes.
			while ( twwrap.dom.firstChild )
				twwrap.dom.removeChild(twwrap.dom.firstChild);
			// Then append all the newly wikified nodes.
			var nodes = twve.tiddler.getPreviewedNodes(txt);
			for ( var i=0,len=nodes.length; i<len; i++ )
				twwrap.dom.appendChild(nodes[0]);
			// Restore folding status for foldable wrappers
			foldable = twwrap.findElements(selector);
			// Prepare elements if defined.
			return twwrap.checkAndPrepare(foldable,folded);
		};
		// refresh all copies
		twwrap.refreshAll = function(txt){
			// Refresh the wrapper twwrap,
			// and synchronize all transcluded copies.

			// The following two variables are for refreshing
			// part or whole of a folded wrapper.
			var animated = config.options.chkAnimate;
			config.options.chkAnimate = false;
			// Extract the section title if any
			var sec = twwrap.sliceKey
				?	twve.text.tiddlerSlice(
						twwrap.wrapper_title
					)
				:	twve.text.tiddlerSection(
						twwrap.wrapper_title
					);
			// Record the window scroll positions.
			var scrL = window.pageXOffset;
			var scrT = window.pageYOffset;
			// Loop through all copies of this wrapper
			twwrap.findWrappers();
			for (var n=0,len=twwrap.wrapper.length; n<len; n++){
				var w = twwrap.wrapper[n];
				if ( w == twwrap.dom ) {
					// Refresh if it's this very one
					twwrap.refreshSelf(sec,txt);
				} else {
					// Otherwise find the editable copy
					var twcopy = twve.tiddler.createEditableWrapper(w);
					if ( ! twcopy ) continue;
					// Extract its section title
					var w_sec = twve.text.tiddlerSection(
						twcopy.wrapper_title
					) || twve.text.tiddlerSlice(
						twcopy.wrapper_title
					);
					// Do the refreshing if
					//	1.	We are refreshing whole tiddler, or
					//	2.	this wrapper contains the whole tiddler, or
					//	3.	we are refreshing one section and w contains
					//		exactly that section.
					if ( ! sec || ! w_sec || w_sec == sec ) {
						// Exclude the situation where w contains this
						// wrapper, or vice versa.
						if(!(twve.node.contains(w,twwrap.dom)
							|| twve.node.contains(twwrap.dom,w))){
							// unfold it if necessary
							var folded = ! twve.node.isVisible(w)
								? w : null;
							if ( folded )
								twve.node.show(folded);
							// refresh the wrapper
							twcopy.refreshSelf(w_sec,txt);
							// fold it back if necessary
							if ( folded )
								twve.node.hide(folded);
						}
					}
				}
			}
			window.scrollTo(scrL,scrT);
			config.options.chkAnimate = animated;
			return twwrap;
		};
		// update text
		twwrap.updateText = function(txt){
			twwrap.setText(txt[0]);
			return twwrap.refreshAll(txt[0]);
		};
		// multi line
		twwrap.multiLine = function(){
			return true;
		};
		// check and prepare
		twwrap.checkAndPrepare = function(subfoldable,subfolded){
			// This method can be called
			//	1.	upon loading,
			//	2.	upon refreshing.
			// In cases of the 2nd type, this wrapper must have been
			// unfolded (in twwrap.refreshAll), we don't need to take
			// care of that here. In cases of the first, however, this
			// wrapper may or may not be unfolded, we need to take care
			// of that here.
			if ( ! twwrap.dom ) return twwrap;

			// Check the folding status of this wrapper
			var folded = twwrap.isVisible()
				? null
				: twwrap.dom;
			var animated = config.options.chkAnimate;
			config.options.chkAnimate = false;
			// Unfold it if folded
			if ( folded ) {
				// unfold it to refresh the wrapper
				twve.node.show(folded);
			}
			// Unfold sub-wrappers if there are
			if ( subfoldable === undefined ) {
				subfoldable = twwrap.findElements(
					twve.tiddler.twveFoldableSelector()
				);
				subfolded=twve.wrapper.recordFoldable(subfoldable);
			}
			if ( subfoldable ) {
				twve.node.show(subfoldable);
			}
			// Prepare it
			if ( twwrap.dom )
				twve.wrapper.prepareElements(twwrap);
			// Fold back the sub-wrappers if necessary
			if ( subfoldable ) {
				twve.wrapper.restoreFoldable(
					subfoldable,subfolded
				);
			}
			// Fold back this wrapper if necessary
			if ( folded ) {
				twve.node.hide(folded);
			}
			config.options.chkAnimate = animated;
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
			if ( ! config.options.chktwveCoreEnabled )
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
	titleOfWrapper : function (w) {
		// Non-trnascluded wrapper or the tiddler title div.
		w = twve.node.closest(w,'[tiddler]');
		return w ? w.getAttribute('tiddler') : '';
	},
//}}}
/***
!!!! twve.viewer.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, parent){
		// Non-transcluded
		return twve.nodeList.querySelectorAll(
			parent,
			'div[tiddler*="'+title+'"] .viewer'
		);
	},
//}}}
/***
!!!! twve.viewer.create
***/
//{{{
	create : function(src){
		var viewer = twve.wrapper.create(src);
		viewer.clone = function(){
			// Optional, may save a tiny bit of time.
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
	titleOfWrapper : function (w) {
		// <<tabs>> transcluded wrapper.

		// It suffices to use w.previousSibling.querySelectorAll(...) to
		// locate the selected tab and retrieve the tiddler title from
		// its attribute "content".

		// In earlier versions I used jQuery to accomplish this. At that
		// time I thought using $w.prev() should be faster than
		// $w.parent() and did some test to confirm my idea. In contrary
		// I found them pretty much the same performance when the
		// content is fully transcluded. More surprisingly, when the
		// content is partially transcluded, $w.parent() is better than
		// $w.prev() for sure. Therefore $w.parent(), instead of
		// $w.prev(), is used here to find the tiddler title.

		//return w.previousSibling.querySelector('.tabSelected')
		//			.getAttribute('content');
		return w.parentNode.querySelector('.tabSelected')
				.getAttribute('content');
	},
//}}}
/***
!!!! twve.tabContent.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, parent){
		// <<tabs>> transcluded
		var wrapper = twve.nodeList.querySelectorAll(
			parent,
			'.tabSelected[content*="'+title+'"]'
		);
		if ( ! wrapper ) return null;

		for(var i=0,len=wrapper.length; i<len; i++)
			wrapper[i] = wrapper[i].parentNode.nextSibling;
		return wrapper;
	},
//}}}
/***
!!!! twve.tabContent.create
***/
//{{{
	create : function(src){
		var tabContent = twve.wrapper.create();
		tabContent.clone = function(){
			// Optional, may save a tiny bit of time.
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
		if ( src ) {
			var focus = twve.tiddler.focusElem();
			if ( focus && focus.dom == src.parentNode ) {
				return twve.element.create();
			}
		}
		return null;
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
	titleOfWrapper : function (w) {
		// <<tiddler>> transcluded wrapper.
		return w.getAttribute('tiddler');
	},
//}}}
/***
!!!! twve.tiddlerSpan.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, parent){
		// <<tiddler>> transcluded
		return twve.nodeList.querySelectorAll(
			parent,
			'span[tiddler*="'+title+'"]'
		);
	},
//}}}
/***
!!!! twve.tiddlerSpan.markupTags
***/
//{{{
	markupTags : function(){
		// <<tiddler>> transcluded
		var tags = twve.tags.create(
			'<<tiddler',
			'>>'
		);
		// blockElement
		tags.blockElement = true;
		return tags;
	},
//}}}
/***
!!!! twve.tiddlerSpan.create
***/
//{{{
	create : function(src){
		var tiddlerSpan = twve.wrapper.create();
		// markupTags
		tiddlerSpan.markupTags = function(){
			// Optional, may save a tiny bit of time.
			return twve.tiddlerSpan.markupTags();
		};
		// clone
		tiddlerSpan.clone = function(){
			// Optional, may save a tiny bit of time.
			return twve.tiddlerSpan.create(tiddlerSpan);
		};
		// starts
		var preStarts = tiddlerSpan.starts;
		tiddlerSpan.starts = function(){
			tiddlerSpan.sliceKey = twve.text.tiddlerSlice(
				tiddlerSpan.wrapper_title
			);
			if ( ! tiddlerSpan.sliceKey )
				return preStarts.apply(this,arguments);

			var text = tiddlerSpan.tiddler.text;
			store.slicesRE.lastIndex = 0;
			while(true) {
				var m = store.slicesRE.exec(text);
				if ( ! m ) break;
				if ( m[2] ) {
					if ( m[2] == tiddlerSpan.sliceKey ) {
						tiddlerSpan.sliceValue = m[3];
						tiddlerSpan.start.ndx = m.index;
						tiddlerSpan.end.ndx = store.slicesRE.lastIndex;
						break;
					}
				} else if ( m[5] == tiddlerSpan.sliceKey ) {
					tiddlerSpan.sliceValue = m[6];
					tiddlerSpan.start.ndx = m.index;
					tiddlerSpan.end.ndx = store.slicesRE.lastIndex-1;
					break;
				}
			}
			return tiddlerSpan.start;
		};
		// ends
		var preEnds = tiddlerSpan.ends;
		tiddlerSpan.ends = function(){
			return tiddlerSpan.sliceKey
				? tiddlerSpan.end
				: preEnds.apply(this,arguments);
		};
		// getText
		var preGetText = tiddlerSpan.getText;
		tiddlerSpan.getText = function(){
			return tiddlerSpan.sliceKey
				? (tiddlerSpan.sliceValue || '')
				: preGetText.apply(this,arguments);
		};
		// setText
		var preSetText = tiddlerSpan.setText;
		tiddlerSpan.setText = function(newtxt){
			if ( ! tiddlerSpan.sliceKey )
				return preSetText.apply(this,arguments);
			// There is sliceKey, meaning we are setting the slice
			// value.
			var text = tiddlerSpan.tiddler.text;
			var p0, p1, len = 0;
			if ( tiddlerSpan.sliceValue ) {
				p0 = text.indexOf(
					tiddlerSpan.sliceValue,tiddlerSpan.start.ndx
				);
				len = tiddlerSpan.sliceValue.length;
				p1 = p0 + len;
			} else {
				p1 = p0 = tiddlerSpan.end.ndx;
			}
			text = text.substring(0,p0) +
				newtxt +
				text.substring(p1);
			tiddlerSpan.end.ndx += (newtxt?newtxt.length:0) - len;
			tiddlerSpan.sliceValue = newtxt;
			// update tiddler text
			twve.tiddler.saveText(tiddlerSpan,text);
			return tiddlerSpan;
		};
		// End of tiddlerSpan
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
		selector.includeSelector(twve.sliderPanel.getSelector());
		return selector;
	},
//}}}
/***
!!!! twve.sliderPanel.titleOfWrapper
***/
//{{{
	titleOfWrapper : function (w) {
		// <<slider>> transcluded wrapper.
		return w.getAttribute('tiddler');
	},
//}}}
/***
!!!! twve.sliderPanel.wrapperFromTitle
***/
//{{{
	wrapperFromTitle : function(title, parent){
		// <<slider>> transcluded
		return twve.nodeList.querySelectorAll(
			parent,
			'div.sliderPanel[tiddler*="'+title+'"]'
		);
	},
//}}}
/***
!!!! twve.sliderPanel.markupTags
***/
//{{{
	markupTags : function(){
		// <<slider>> transcluded
		var tags = twve.tags.create(
			'<<slider',
			'>>'
		);
		// blockElement
		tags.blockElement = true;
		return tags;
	},
//}}}
/***
!!!! twve.sliderPanel.create
***/
//{{{
	create : function(src){
		var sliderPanel = twve.transcludedElem.create(src)
			|| twve.wrapper.create();
		// markupTags
		sliderPanel.markupTags = function(){
			// Optional, may save a tiny bit of time.
			return twve.sliderPanel.markupTags();
		};
		// clone
		sliderPanel.clone = function(){
			// Optional, may save a tiny bit of time.
			return twve.sliderPanel.create(sliderPanel);
		};
		return sliderPanel.created(src);
	}
};
//}}}
/***
!!! twve.foldedSection
***/
//{{{
twve.foldedSection = {
//}}}
/***
!!!! twve.foldedSection.macro
***/
//{{{
	macro : function(){
		return '<<foldHeadings>>';
	},
//}}}
/***
!!!! twve.foldedSection.twveSelector
***/
//{{{
	enableEdit : true,
	getSelector : function(){
		return 'span.sliderPanel';
	},
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		if ( twve.foldedSection.enableEdit )
			// For this wrapper we do not return selector if disabled.
			// See explanations below in titleOfTiddler.
			selector.includeSelector('span.sliderPanel');
		return selector;
	}
};
//}}}
/***
!!! twve.tiddlerTitle
***/
//{{{
twve.tiddlerTitle = {
//}}}
/***
!!!! twve.tiddlerTitle.twveSelector
***/
//{{{
	enableEdit : true,
	twveSelector : function(selector){
		// This is the required method for an editable object that
		// should/could
		//	1. (required) add the selector to include
		//	2. (optional) add the selector to exclude
		if ( ! selector ) selector = twve.selector.create();
		selector.includeSelector('div.title');
		return selector;
	},
//}}}
/***
!!!! twve.tiddlerTitle.titleOfWrapper
***/
//{{{
	titleOfWrapper : function(w){
		return w.textContent;
	},
//}}}
/***
!!!! twve.tiddlerTitle.create
***/
//{{{
	create : function(elem){
		var tidTitle = twve.wrapper.create();
		// setText
		tidTitle.setText = function(txt){
			twve.tiddler.saveText(tidTitle,null,txt);
			return tidTitle;
		};
		// ..........................................................
		// var preGetText = tidTitle.getText;
		tidTitle.getText = function(){
			return tidTitle.tiddler.title;
		};
		// ..........................................................
		tidTitle.mouseleave = function(ev){
			var menu = twve.tiddler.getOptionsMenu();
			if ( menu.dom == ev.relatedTarget )
				return false;
			menu.hide(true);
			return true;
		};
		// ..........................................................
		tidTitle.blur = function(){
			twve.tiddler.getOptionsMenu().hide(true);
		};
		// ..........................................................
		tidTitle.multiLine = function(){
			return false;
		};
		// ..........................................................
		tidTitle.box = function(action){
			var eb = twve.node.box(tidTitle.dom);
			if ( /focus/i.test(action) ) {
				var pos = twve.object.create();
				pos.left = eb.right;
				pos.top = eb.top;
				twve.tiddler.getOptionsMenu().showRoot(pos,'left');
			}
			return twve.tiddler.editWrappers() ? eb : null;
		}
		// ..........................................................
		tidTitle.isWrapper = function(){
			return false;
		};
		// ..........................................................
		tidTitle.titleOfWrapper = function(){
			return tidTitle.dom.textContent;
		};
		// ..........................................................
		return tidTitle.created(elem);
	}
};
//}}}
