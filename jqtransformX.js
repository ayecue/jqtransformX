/**
 *	Name: jqtransformX
 *	Author: swe
 *	Version: 0.1.0.0
 *
 *
 *	Description:
 *		Do the same like the original jqtransform just better.
 */
(function($){
	"use strict";
	
	/**
	 *	Static Vars
	 */
	var INPUTBUTTON = 'input:submit, input:reset, input[type="button"]',
		INPUTTEXT = 'input:text, input:password',
		CHECKBOX = 'input:checkbox',
		RADIO = 'input:radio',
		TEXTAREA = 'textarea',
		SELECT = 'select';
	
	var /**
		 *	Global Vars
		 */
		lastOpenSelect,
		/**
		 *	Static Functions
		 */
		getLabel = function(element){
			var label = element.next();
			
			if (!label.is('label'))
			{
				if ((label = element.prev()).is('label'))
				{
					var form = element[0] ? element[0].form : null,
						id = element.attr('id');
						
					if (id && form)
					{
						label = $(form).find('label[for="'+id+'"]');
					}
				}
			}
			
			return label.is('label') ? label.css('cursor','pointer') : false;	
		},
		/**
		 *	Main Class
		 */
		transform = function(element,options){
			if (typeof options == 'object')
			{
				options = $.extend({preloadImg:true},options);
				
				var stack = {keys:[]},
					exec = {
						transformInputButton 	: $(INPUTBUTTON, element),
						transformInputText 		: $(INPUTTEXT, element),
						transformCheckbox 		: $(CHECKBOX, element),
						transformRadio 			: $(RADIO, element),
						transformTextarea 		: $(TEXTAREA, element),
						transformSelect 		: $(SELECT, element)
					};
				
				for (var func in exec)
				{
					if (!!exec[func] && exec[func].length > 0 && !!this[func])
					{
						var gen = new this[func](exec[func],stack);
					
						if (!!gen)
						{
							stack[func] = gen;
							stack.keys.push(func);
						}
					}
				}
					
				return stack;
			}
			else if (typeof options == 'string' && this[options])
			{
				gen = new this[options](element,null);
			
				if (!!gen)
				{
					var stack = {keys:[]};
					
					stack[options] = gen;
					stack.keys.push(options);
				
					return stack;
				}
			}
			
			return false;
		};
	
	/**
	 *	Prototypes
	 */
	$.extend(transform.prototype,{
		/***************************
		  Buttons
		 ***************************/
		transformInputButton : function(element,_){
			var stack = [];
			
			for (var index = 0, length = element.length; index < length; index++)
			{
				var item = element[index],
					$item = $(item);
					
				if($item.hasClass('jqTransformButton'))
				{
					continue;
				}
				
				/* Create objects */
				var	label = getLabel($item),
					$copy = $item.clone(true,true),
					$button = $(
						'<button id="'
							+ item.id +
						'" name="'
							+ item.name +
						'" type="'
							+ item.type +
						'" class="'
							+ item.className +
						' jqTransformButton"><span><span>'
							+ $item.attr('value') +
						'</span></span>'
					)
						.hover(function(){$button.addClass('jqTransformButton_hover');},function(){$button.removeClass('jqTransformButton_hover')})
						.mousedown(function(){$button.addClass('jqTransformButton_click')})
						.mouseup(function(){$button.removeClass('jqTransformButton_click')});
					
				$item.replaceWith($button);
				
				/* Create object for better control */
				var object = {
					inputButton : $button,
					label : label,
					/* Clear everything */
					clear : function(){
						if (!item)
						{
							throw 'Double free.';
						}
					
						$button.replaceWith($copy);
						
						item = $item = $copy = $button = label = null;
					},
					parentInstance : _,
					context : element.context
				};
				
				$.data(item,'jqTransform',object);
				stack.push(object);
			}
			
			return stack;
		},
		/***************************
		  Text Fields 
		 ***************************/
		transformInputText : function(element,_){
			var stack = [];
			
			for (var index = 0, length = element.length; index < length; index++)
			{
				var item = element[index],
					$item = $(item);
					
				if($item.hasClass('jqTransformHidden') || !$item.is('input'))
				{
					continue;
				}
				
				/* Create objects */
				var label = getLabel($item),
					size = $item.width(),
					attrSize = $item.attr('size'),
					itemFocus,itemBlur,itemHover;
					
				if(!!attrSize)
				{
					$item.css('width',size = attrSize*10);
				}
				
				$item.addClass("jqTransformInput").wrap('<div class="jqTransformInputWrapper"><div class="jqTransformInputInner"><div></div></div></div>');
				var $wrapper = $item.parent().parent().parent().css("width", size+10);
				
				$item
					.focus(itemFocus = function(){$wrapper.addClass("jqTransformInputWrapper_focus");})
					.blur(itemBlur = function(){$wrapper.removeClass("jqTransformInputWrapper_focus");})
					.hover(itemHover = function(){$wrapper.addClass("jqTransformInputWrapper_hover");},function(){$wrapper.removeClass("jqTransformInputWrapper_hover");});
					
				/* If this is safari we need to add an extra class */
				if ($.browser.safari)
				{
					$wrapper.addClass('jqTransformSafari');
					$item.css('width',$wrapper.width()+16);
				}
				
				/* Create object for better control */
				var object = {
					inputText : $item,
					label : label,
					/* Clear everything */
					clear : function(){
						if (!item)
						{
							throw 'Double free.';
						}
					
						$item
							.unbind('focus',itemFocus)
							.unbind('blur',itemBlur)
							.unbind('hover',itemHover)
							.unwrap();
						
						item = $item = $wrapper = label = null;
					},
					parentInstance : _,
					context : element.context
				};
				
				$.data(item,'jqTransform',object);
				stack.push(object);
			}
			
			return stack;
		},
		/***************************
		  Check Boxes 
		 ***************************/	
		transformCheckbox : function(element,_){
			var stack = [];
			
			for (var index = 0, length = element.length; index < length; index++)
			{
				var item = element[index],
					$item = $(item);
					
				if($item.hasClass('jqTransformHidden'))
				{
					continue;
				}
				
				/* Create objects */
				var label = getLabel($item),
					$trigger = $('<a href="#" class="jqTransformCheckbox"></a>'),
					$wrapper = $item
					.addClass('jqTransformHidden')
					.wrap('<span class="jqTransformCheckboxWrapper"></span>')
					.parent()
					.prepend($trigger),
					itemChange;
					
				$item.change(itemChange = function(){
					item.checked 
						&& $trigger.addClass('jqTransformChecked') 
						|| $trigger.removeClass('jqTransformChecked');
						
					return true;
				});
				
				/* Click handler */
				$trigger.click(function(){
					if (!$item.attr('disabled'))
					{
						$input.trigger('click').trigger('change');
					}				
					
					return false;
				});
				
				/* set the default state */
				item.checked && $trigger.addClass('jqTransformChecked');
				
				/* Create object for better control */
				var object = {
					checkbox : $item,
					label : label,
					/* Clear everything */
					clear : function(){
						if (!item)
						{
							throw 'Double free.';
						}
					
						$item.unbind('change',itemChange);
						$trigger.unbind('click').remove();
						$item.unwrap();
						
						item = $item = $wrapper = $trigger = label = null;
					},
					parentInstance : _,
					context : element.context
				};
				
				$.data(item,'jqTransform',object);
				stack.push(object);
			}
			
			return stack;
		},
		/***************************
		  Radio Buttons 
		 ***************************/
		transformRadio : function(element,_){
			var stack = [];
			
			for (var index = 0, length = element.length; index < length; index++)
			{
				var item = element[index],
					$item = $(item);
					
				if($item.hasClass('jqTransformHidden'))
				{
					continue;
				}
				
				/* Create objects */
				var label = getLabel($item),
					$trigger = $('<a href="#" class="jqTransformRadio" rel="'+ item.name +'"></a>'),
					$wrapper = $item
					.addClass('jqTransformHidden')
					.wrap('<span class="jqTransformRadioWrapper"></span>')
					.parent()
					.prepend($trigger),
					itemChange;
				
				$item.change(itemChange = function(){
					item.checked 
						&& $trigger.addClass('jqTransformChecked') 
						|| $trigger.removeClass('jqTransformChecked');
						
					return true;
				});
				
				/* Click handler */
				$trigger.click(function(){
					if (!$item.attr('disabled'))
					{
						$input.trigger('click').trigger('change');
						
						$('input[name="'+$item.attr('name')+'"]',item.form).not($item).each(function(){
							var other = $(this);
						
							other.attr('type')=='radio' && other.trigger('change');
						});
					}				
					
					return false;
				});
				
				/* set the default state */
				item.checked && $trigger.addClass('jqTransformChecked');
				
				/* Create object for better control */
				var object = {
					radio : $item,
					label : label,
					/* Clear everything */
					clear : function(){
						if (!item)
						{
							throw 'Double free.';
						}
					
						$item.unbind('change',itemChange);
						$trigger.unbind('click').remove();
						$item.unwrap();
						
						item = $item = $wrapper = $trigger = label = null;
					},
					parentInstance : _,
					context : element.context
				};
				
				$.data(item,'jqTransform',object);
				stack.push(object);
			}
			
			return stack;
		},
		/***************************
		  TextArea 
		 ***************************/
		transformTextarea : function(element,_){
			var stack = [];
			
			for (var index = 0, length = element.length; index < length; index++)
			{
				var item = element[index],
					$item = $(item);
					
				if($item.hasClass('jqtransformdone')) 
				{
					continue;
				}
				$item.addClass('jqtransformdone');
				
				/* Create objects */
				var label = getLabel($item),
					$table = $(
						'<table cellspacing="0" cellpadding="0" border="0" class="jqTransformTextarea">'
						+ '<tr><td class="jqTransformTextarea-tl"></td><td class="jqTransformTextarea-tm"></td><td class="jqTransformTextarea-tr"></td></tr>'
						+ '<tr><td class="jqTransformTextarea-ml">&nbsp;</td><td class="jqTransformTextarea-mm"><div></div></td><td class="jqTransformTextarea-mr">&nbsp;</td></tr>'
						+ '<tr><td class="jqTransformTextarea-bl"></td><td class="jqTransformTextarea-bm"></td><td class="jqTransformTextarea-br"></td></tr>'
						+ '</table>'
					)
					.insertAfter($item)
					.hover(function(){
						!$table.hasClass('jqTransformTextarea-focus') && $table.addClass('jqTransformTextarea-hover');
					},function(){
						$table.removeClass('jqTransformTextarea-hover');
					}),
					$middle = $('.jqTransformTextarea-mm',$table),
					$wrapper = $middle.children('div'),itemFocus,itemBlur;
				
				$item
					.focus(itemFocus = function(){$table.removeClass('jqTransformTextarea-hover').addClass('jqTransformTextarea-focus');})
					.blur(itemBlur = function(){$table.removeClass('jqTransformTextarea-focus');})
					.appendTo($wrapper);
				
				/* Safari Fix */
				if($.browser.safari)
				{
					$middle
						.addClass('jqTransformSafariTextarea');
						
					$wrapper
						.css('height',textarea.height())
						.css('width',textarea.width());
				}
				
				/* Create object for better control */
				var object = {
					textarea : $item,
					label : label,
					/* Clear everything */
					clear : function(){
						if (!item)
						{
							throw 'Double free.';
						}
					
						$table.unbind('hover').remove();
						$item.unbind('focus',itemFocus);
						$item.unbind('blur',itemBlur);
						
						item = $item = $wrapper = $table = label = null;
					},
					parentInstance : _,
					context : element.context
				};
				
				$.data(item,'jqTransform',object);
				stack.push(object);
			}
			
			return stack;
		},
		/***************************
		  Select 
		 ***************************/
		transformSelect : function(element,_){
			var stack = [];
			
			for (var index = 0, length = element.length; index < length; index++)
			{
				var item = element[index],
					$item = $(item);
				
				if ($item.hasClass('jqTransformHidden') || !!$item.attr('multiple'))
				{
					continue;
				}
				
				var label = getLabel($item),
					/* Do the wrap */
					$wrapper = $item
					.addClass('jqTransformHidden')
					.wrap('<div class="jqTransformSelectWrapper"></div>')
					.parent();
					
				/* Add the fancy content */
				$wrapper.prepend('<div><span></span><a href="#" class="jqTransformSelectOpen"></a></div><ul></ul>');
				var $span = $('span:eq(0)', $wrapper),
					$ul = $('ul', $wrapper).css('width',$item.width()).hide(),
					//Caching the selects
					selectedIndex = $item.find('option:selected').index() || 0,
					selectedRow = [];
				/* Add the selector tree */
				$('option',item).each(function(index){
					var $option = $(this),
						$li = $('<li>'),
						$a = $('<a href="#" index="'+ index +'">'+ $option.html() +'</a>');
						
					$ul.append($li);
					$li.append($a);
					
					/* Add the click event */
					$a.click(function(){
						/* Switch selected */
						if (index != selectedIndex)
						{
							/* Change state */
							selectedRow[selectedIndex].removeClass('selected');
							object.rowIndex = item.selectedIndex = selectedIndex = index;
							$a.addClass('selected');
							/* Fire event */
							if (!!item.onchange)
							{
								item.onchange();
							}
							$item.trigger('change');
							$span.html($a.html());
						}
						$ul.hide();
						
						return false;
					});
					
					selectedRow.push($a);
				});
				
				/* Set to default */
				selectedRow[selectedIndex].addClass('selected');
				$span.html(selectedRow[selectedIndex].html());
				
				/* Open dropdown */
				var $open = $('a.jqTransformSelectOpen', $wrapper)
					.click(function(){
						/* Check if a box is open */
						if (!!lastOpenSelect && $ul != lastOpenSelect) 
						{
							lastOpenSelect.hide();
						}
						/* Check if disabled */
						if (!$item.attr('disabled'))
						{
							lastOpenSelect = $ul;
							$ul.slideToggle('fast');
						}
						
						return false;
					});
					
				/* Set width */
				var itemWidth = $item.outerWidth(),
					newWidth = $.browser.msie && parseInt($.browser.version, 10) == 7
						? ((itemWidth > ($span.innerWidth()-20)) ? itemWidth+($open.outerWidth()-20) : ($wrapper.width()-20))
						: ((itemWidth > $span.innerWidth()) ? itemWidth+$open.outerWidth() : $wrapper.width());
				
				$wrapper.css('width',newWidth);
				$ul.css('width',newWidth-2);
				$span.css('width',itemWidth);
				
				/* 	Calculate the height if necessary, less elements that the default height
					show the ul to calculate the block, if ul is not displayed li height value is 0 */
				$ul.css({display:'block',visibility:'hidden'});
				var itemHeight = (selectedRow.length)*($('li:first',$ul).height());//+1 else bug ff
				(itemHeight < $ul.height()) && $ul.css({height:itemHeight,'overflow':'hidden'});//hidden else bug with ff
				$ul.css({display:'none',visibility:'visible'});
				
				/* Create object for better control */
				var object = {
					select : $item,
					row : selectedRow,
					rowIndex : selectedIndex,
					label : label,
					/* Clear everything */
					clear : function(){
						if (!item)
						{
							throw 'Double free.';
						}
					
						$open.unbind('click');
						for (var j = selectedRow.length; j--; selectedRow[j].unbind('click'));
						$wrapper.children('div:first').remove();
						$ul.remove();
						$item
							.unwrap()
							.removeClass('jqTransformHidden');
							
						$.removeData(item,'jqTransform');
						
						item = $item = $wrapper = $ul = $span = $open = selectedRow = label = null;
					},
					parentInstance : _,
					context : element.context
				};
				
				$.data(item,'jqTransform',object);
				stack.push(object);
			}
			
			return stack;
		}
	});
	
	/**
	 *	External mouse event 
	 */
	$(document).mousedown(function(_){
		if (!!lastOpenSelect && $(_.target).parents('.jqTransformSelectWrapper').length == 0)
		{
			lastOpenSelect.hide();
			lastOpenSelect = null;
		}
	});
	
	/**
	 *	Extend jQuery 
	 */
	$.fn.jqTransformProp = function(){
		var item = this[0],
			$item = $(item);
			
		if ($item.hasClass('jqtransformdone') || $item.hasClass('jqTransformHidden'))
		{
			return $.data(item,'jqTransform');
		}
		
		return false;
	};

	$.fn.jqTransform = function(options){
		return this.each(function(_,item){
			var $item = $(item);
			
			if ($item.hasClass('jqtransformdone'))
			{
				return;
			}
				
			$.data(item, 'jqTransform', new transform($item,options || {}));
			$item.addClass('jqtransformdone');
		});
	};
	
	$.fn.jqTransInputButton = function(options){
		return this.each(function(_,item){
			transform($(item),'transformInputButton');
		});
	};
	
	$.fn.jqTransInputText = function(options){
		return this.each(function(_,item){
			transform($(item),'transformInputText');
		});
	};
	
	$.fn.jqTransRadio = function(options){
		return this.each(function(_,item){
			transform($(item),'transformRadio');
		});
	};
	
	$.fn.jqTransTextarea = function(options){
		return this.each(function(_,item){
			transform($(item),'transformTextarea');
		});
	};
	
	$.fn.jqTransSelect = function(options){
		return this.each(function(_,item){
			transform($(item),'transformSelect');
		});
	};
})(jQuery);