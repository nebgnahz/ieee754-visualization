// This file was generated by modules-webmake (modules for web) project.
// See: https://github.com/medikoo/modules-webmake

(function (modules) {
	'use strict';

	var resolve, getRequire, wmRequire, notFoundError, findFile
	  , extensions = {".js":[],".json":[],".css":[],".html":[]}
	  , envRequire = typeof require === 'function' ? require : null;

	notFoundError = function (path) {
		var error = new Error("Could not find module '" + path + "'");
		error.code = 'MODULE_NOT_FOUND';
		return error;
	};
	findFile = function (scope, name, extName) {
		var i, ext;
		if (typeof scope[name + extName] === 'function') return name + extName;
		for (i = 0; (ext = extensions[extName][i]); ++i) {
			if (typeof scope[name + ext] === 'function') return name + ext;
		}
		return null;
	};
	resolve = function (scope, tree, path, fullPath, state, id) {
		var name, dir, exports, module, fn, found, ext;
		path = path.split('/');
		name = path.pop();
		if ((name === '.') || (name === '..')) {
			path.push(name);
			name = '';
		}
		while ((dir = path.shift()) != null) {
			if (!dir || (dir === '.')) continue;
			if (dir === '..') {
				scope = tree.pop();
				id = id.slice(0, id.lastIndexOf('/'));
			} else {
				tree.push(scope);
				scope = scope[dir];
				id += '/' + dir;
			}
			if (!scope) throw notFoundError(fullPath);
		}
		if (name && (typeof scope[name] !== 'function')) {
			found = findFile(scope, name, '.js');
			if (!found) found = findFile(scope, name, '.json');
			if (!found) found = findFile(scope, name, '.css');
			if (!found) found = findFile(scope, name, '.html');
			if (found) {
				name = found;
			} else if ((state !== 2) && (typeof scope[name] === 'object')) {
				tree.push(scope);
				scope = scope[name];
				id += '/' + name;
				name = '';
			}
		}
		if (!name) {
			if ((state !== 1) && scope[':mainpath:']) {
				return resolve(scope, tree, scope[':mainpath:'], fullPath, 1, id);
			}
			return resolve(scope, tree, 'index', fullPath, 2, id);
		}
		fn = scope[name];
		if (!fn) throw notFoundError(fullPath);
		if (fn.hasOwnProperty('module')) return fn.module.exports;
		exports = {};
		fn.module = module = { exports: exports, id: id + '/' + name };
		fn.call(exports, exports, module, getRequire(scope, tree, id));
		return module.exports;
	};
	wmRequire = function (scope, tree, fullPath, id) {
		var name, path = fullPath, t = fullPath.charAt(0), state = 0;
		if (t === '/') {
			path = path.slice(1);
			scope = modules['/'];
			if (!scope) {
				if (envRequire) return envRequire(fullPath);
				throw notFoundError(fullPath);
			}
			id = '/';
			tree = [];
		} else if (t !== '.') {
			name = path.split('/', 1)[0];
			scope = modules[name];
			if (!scope) {
				if (envRequire) return envRequire(fullPath);
				throw notFoundError(fullPath);
			}
			id = name;
			tree = [];
			path = path.slice(name.length + 1);
			if (!path) {
				path = scope[':mainpath:'];
				if (path) {
					state = 1;
				} else {
					path = 'index';
					state = 2;
				}
			}
		}
		return resolve(scope, tree, path, fullPath, state, id);
	};
	getRequire = function (scope, tree, id) {
		return function (path) {
			return wmRequire(scope, [].concat(tree), path, id);
		};
	};
	return getRequire(modules, [], '');
})({
	"ieee754-visualization": {
		"src": {
			"bits.js": function (exports, module, require) {
				var ieee754 = require("./ieee754");
				var dom = require("./dom");

				var visualization = dom.$(".visualization-bits");
				var numberInput = dom.$("#number-input");


				function classNameFilter( className ){
				    return function( bit ){ return bit.classList.contains(className); };
				}

				var bits = dom.$$(".bit", visualization);
				var bitsSign = bits.filter( classNameFilter("sign") );
				var bitsExponent = bits.filter( classNameFilter("exponent") );
				var bitsHidden = bits.filter( classNameFilter("hidden") );
				var bitsSignificand = bits.filter( classNameFilter("significand") );

				var pointSlider = dom.$("#point-slider");
				var pointSliderLabel = dom.$("#point-slider-label");

				function getInputNumberValue() {
				    return Number( numberInput.value.replace(/\u2212/g, "-") );
				}

				function setNumberInputValue( value ) {
				    value = Number( value );
				    if (value === 0 && (1/value < 0)) {
				        // special case to detect and show negative zero
				        value = "-0";
				    } else {
				        value = Number.prototype.toString.call(value);
				    }

				    value = value.replace(/-/g, "\u2212"); //pretty minus

				    if (value !== numberInput.value) {
				        numberInput.value = value;
				    }
				    updateVisualizatoin();
				}


				function updateBitElementClasses( bitElements, bits, prevBit ) {
				    prevBit = typeof prevBit == "string" ? prevBit.slice(-1) : "0";
				    for (var i = 0; i < bits.length; i++) {
				        var bitElement = bitElements[ i ];
				        bitElement.classList.remove("one");
				        bitElement.classList.remove("zero");
				        bitElement.classList.remove("prev-one");
				        bitElement.classList.remove("prev-zero");

				        bitElement.classList.add(bits[i] == "1" ? "one" : "zero");
				        if (i === 0) {
				            bitElement.classList.add(prevBit == "1" ? "prev-one" : "prev-zero");
				        }
				    }
				}


				function updateBinary( parsed ) {
				    var isExpandedMode = visualization.classList.contains("expanded");

				    updateBitElementClasses( bitsSign, parsed.bSign );
				    updateBitElementClasses( bitsExponent, parsed.bExponent, isExpandedMode ? "0" : parsed.bSign );
				    updateBitElementClasses( bitsHidden, parsed.bHidden );
				    updateBitElementClasses( bitsSignificand, parsed.bSignificand, isExpandedMode ? parsed.bHidden : parsed.bExponent );

				    pointSliderLabel.style.left = (parsed.exponentNormalized - 1) * 15 + "px";

				    if (parsed.exponent !== Number(pointSlider.value)) {
				        pointSlider.value = parsed.exponent;
				    }
				}


				function classNamesToBinaryString( binaryString, bitSpan ) {
				    binaryString += bitSpan.classList.contains("zero") ? "0" : "1";
				    return binaryString;
				}

				function updateNumber( values ) {
				    var b = "";

				    var exponent, significand;
				    if (values) {
				        exponent = values.exponent;
				        significand = values.significand;
				    }

				    if (typeof exponent == "number") {
				        exponent = ieee754.intToBinaryString( exponent, 11 );
				    } else {
				        exponent = bitsExponent.reduce( classNamesToBinaryString, "" );
				    }

				    if (typeof significand != "string") {
				        significand = bitsSignificand.reduce( classNamesToBinaryString, "" );
				    }

				    b += bitsSign.reduce( classNamesToBinaryString, "" );
				    b += exponent;
				    b += significand;

				    var f = ieee754.binaryStringToFloat32( b );
				    setNumberInputValue( f );
				}


				function generatePowersHtml( b, startPower, classPrefix, useOne ) {
				    if (typeof startPower != "number") {
				        startPower = b.length - 1;
				    }

				    classPrefix = classPrefix || "exponent-bit-";

				    var htmlPowers = "";
				    var htmlComputed = "";
				    var htmlFractions = "";
				    var htmlFractionsComputed = "";

				    var allZeros = true;
				    for (var i = 0, l = b.length; i < l; i++) {
				        if (b[i] == "1") {
				            allZeros = false;
				            var p = startPower - i;
				            var j = b.length - 1 -i;
				            if (htmlPowers.length > 0) {
				                htmlPowers += "<span class='mo'> + </span>";
				                htmlComputed += "<span class='mo'> + </span>";
				                htmlFractions += "<span class='mo'> + </span>";
				                htmlFractionsComputed += "<span class='mo'> + </span>";
				            }

				            var powerHtml = '<span class="msup '+ (classPrefix + j) +'"><span class="mn">2</span><span class="mn">'+ p +'</span></span>';

				            if (useOne && p == 0) {
				                powerHtml = '<span class="mn '+ (classPrefix + j) +'">1</span>';
				            }
				            htmlPowers += powerHtml;
				            htmlComputed += '<span class="mn '+ (classPrefix + j) +'">' + Math.pow(2,p)+ '</span>';

				            if (p >= 0) {
				                htmlFractions += powerHtml;
				                htmlFractionsComputed += '<span class="mn '+ (classPrefix + j) +'">' + Math.pow(2,p)+ '</span>';
				            } else {
				                htmlFractions += '<span class="mfrac '+ (classPrefix + j) +'"><span class="mn">1</span><span class="msup"><span class="mn">2</span><span class="mn">' + -p + '</span></span></span>';
				                htmlFractionsComputed += '<span class="mfrac '+ (classPrefix + j) +'"><span class="mn">1</span><span class="mn">'+ Math.pow(2,-p) +'</span></span>';
				            }
				        }
				    }

				    if (allZeros) {
				        htmlPowers = htmlComputed = htmlFractions = htmlFractionsComputed = '<span class="mn">0</span>';
				    }

				    htmlFractionsComputed = htmlFractionsComputed.replace(/Infinity/g, "&infin;");

				    return {
				        powers: htmlPowers,
				        computed: htmlComputed,
				        fractions: htmlFractions,
				        fractionsComputed: htmlFractionsComputed
				    };
				}

				function updateMath( representation ) {
				    // enrich representation with powers HTML

				    var htmlExponent = generatePowersHtml( representation.bExponent );

				    representation.exponentPowers = htmlExponent.powers;
				    representation.exponentPowersComputed = htmlExponent.computed;

				    var significandBits = representation.bHidden + representation.bSignificand;

				    representation.exponentZero = representation.exponent;
				    representation.exponentNormalizedZero = representation.exponentNormalized;


				    // [...] subnormal numbers are encoded with a biased exponent of 0,
				    // but are interpreted with the value of the smallest allowed exponent,
				    // which is one greater (i.e., as if it were encoded as a 1).
				    //
				    // -- http://en.wikipedia.org/wiki/Denormal_number

				    if (representation.exponentNormalizedZero == -127) {

				        representation.exponentZero = representation.exponent + 1;
				        representation.exponentNormalizedZero = representation.exponentNormalized + 1;
				    }

				    var htmlSignificand = generatePowersHtml( significandBits, representation.exponentNormalizedZero, "significand-bit-" );
				    var htmlSignificandNormalized = generatePowersHtml( significandBits, 0, "significand-bit-" );
				    var htmlSignificandNormalizedOne = generatePowersHtml( significandBits, 0, "significand-bit-", true );

				    representation.significandPowersNormalized = htmlSignificandNormalized.powers;
				    representation.significandPowersNormalizedOne = htmlSignificandNormalizedOne.powers;

				    var equation = dom.$(".full-equation");

				    if (isNaN(representation.value)) {
				        representation.significandPowers = representation.significandPowersFractions
				        = representation.significandPowersFractionsComputed = representation.significandPowersComputed
				        = '<span class="mn significand-bit-any">NaN</span>';
				    } else {
				        representation.significandPowers = htmlSignificand.powers;
				        representation.significandPowersFractions = htmlSignificand.fractions;
				        representation.significandPowersFractionsComputed = htmlSignificand.fractionsComputed;
				        representation.significandPowersComputed = htmlSignificand.computed;
				    }

				    if (representation.sign < 0)
				        representation.signHtml = String(representation.sign).replace("-", "&minus;");
				    else
				        representation.signHtml = "+" + representation.sign;

				    representation.absValue = Math.abs( representation.value );

				    if (isNaN(representation.absValue)) {
				        representation.absValue = "NaNNaNNaNNaN Batman!"
				    }

				    var dynamic = dom.$$(".math [data-ieee754-value]");

				    dynamic.forEach( function(element){
				        element.innerHTML = representation[ element.dataset.ieee754Value ];
				    });

				    if (isNaN(representation.value) || !isFinite(representation.value)) {
				        equation.classList.add("collapsed");
				    } else {
				        equation.classList.remove("collapsed");
				    }
				}

				function updateVisualizatoin() {
				    var number = getInputNumberValue();
				    var representation = ieee754.toIEEE754F32Parsed( number );

				    updateBinary( representation );
				    updateMath( representation );
				}


				// EVENT HANDLERS

				numberInput.addEventListener( "change", function() {
				    setNumberInputValue( getInputNumberValue() );
				}, false);


				numberInput.addEventListener("keydown", function ( event ) {
				    var diff = 0;
				    if ( event.keyCode === 38 || event.keyCode === 40 ) {

				            if ( event.keyCode === 38 ) diff = +1;
				            else diff = -1;

				            if ( event.shiftKey ) {
				                diff *= 10;
				                if ( event.altKey ) {
				                    diff *= 10;
				                }
				            } else if ( event.altKey ) {
				                diff /= 10;
				            }

				            setNumberInputValue( diff + getInputNumberValue() );

				        event.preventDefault();
				    }
				}, false);


				pointSlider.addEventListener( "change", function() {
				    var exponent = Number(pointSlider.value);
				    updateNumber( { exponent: exponent } );
				}, false);

				pointSlider.addEventListener( "click", function() {
				    pointSlider.focus();
				}, false);

				document.body.addEventListener( "click", function( event ){
				    var target = event.target;

				    if (target.classList.contains("zero") || target.classList.contains("one")) {
				        target.classList.toggle("zero");
				        target.classList.toggle("one");

				        updateNumber();
				        updateVisualizatoin();

				        hoverRelatedExponentHandler( event );
				        hoverRelatedSignificandHandler( event );
				        hoverRelatedSignHandler( event );
				    }

				}, false);


				// toggle hover class on parts of equation related to hovered bit
				function createHoverRelatedHandler( selector, classPrefix ) {
				    return function (event) {
				        var target = event.target;
				        if (dom.matchesSelector( target, selector )) {

				            var siblings = dom.arrayify(target.parentNode.children).filter(classNameFilter("bit"));
				            var n = siblings.length - siblings.indexOf( target ) - 1;

				            var related = dom.$$((classPrefix+n)+","+(classPrefix+"any"));
				            related.forEach( function(r){
				                r.classList[ event.type == "mouseout" ? "remove" : "add"]("hover");
				            });
				        }
				    };
				}

				var hoverRelatedExponentHandler = createHoverRelatedHandler( ".bit.exponent", ".exponent-bit-");
				document.body.addEventListener( "mouseover", hoverRelatedExponentHandler, false );
				document.body.addEventListener( "mouseout", hoverRelatedExponentHandler, false );

				var hoverRelatedSignificandHandler = createHoverRelatedHandler( ".bit.significand, .bit.hidden", ".significand-bit-");
				document.body.addEventListener( "mouseover", hoverRelatedSignificandHandler, false );
				document.body.addEventListener( "mouseout", hoverRelatedSignificandHandler, false );

				var hoverRelatedSignHandler = createHoverRelatedHandler( ".bit.sign", ".sign-bit-");
				document.body.addEventListener( "mouseover", hoverRelatedSignHandler, false );
				document.body.addEventListener( "mouseout", hoverRelatedSignHandler, false );


				// toggle nowrap class on a equation row when equals sign is clicked

				document.body.addEventListener( "click", function( event ){
				    var target = event.target;

				    if (dom.matchesSelector(target, ".mrow > .mo")) {
				        target.parentNode.classList.toggle("nowrap");
				    }

				}, false);


				// make exponent value editable

				var dynks = require( "./dynks" );

				var exponentElement = dom.$("#exponent-dynks");
				var exponentNormalizedElement = dom.$("#exponent-normalized-dynks");

				function getCurrentExponentValue() {
				    return +exponentElement.innerHTML;
				}

				function updateExponentValue( value ) {
				    var exponent = Number(value);
				    updateNumber( { exponent: exponent } );
				}
				dynks( exponentElement, getCurrentExponentValue, updateExponentValue );

				function getCurrentExponentNormalizedValue() {
				    return +exponentNormalizedElement.innerHTML;
				}

				function updateExponentNormalizedValue( value ) {
				    var exponent = Number(value);
				    updateNumber( { exponent: exponent + 127 } );
				}
				dynks( exponentNormalizedElement, getCurrentExponentNormalizedValue, updateExponentNormalizedValue );


				dom.$(".toggle-details-button").addEventListener("click", function(){
				    visualization.classList.toggle("expanded");
				}, false);

				// GO!

				updateVisualizatoin();
			},
			"dom.js": function (exports, module, require) {
				// `arraify` takes an array-like object and turns it into real Array
				// to make all the Array.prototype goodness available.
				var arrayify = function ( a ) {
				    return [].slice.call( a );
				};

				// `$` returns first element for given CSS `selector` in the `context` of
				// the given element or whole document.
				var $ = function ( selector, context ) {
				    context = context || document;
				    return context.querySelector(selector);
				};

				// `$$` return an array of elements for given CSS `selector` in the `context` of
				// the given element or whole document.
				var $$ = function ( selector, context ) {
				    context = context || document;
				    return arrayify( context.querySelectorAll(selector) );
				};

				exports.arrayify = arrayify;
				exports.$ = $;
				exports.$$ = $$;


				// cross-browser matchesSelector based on
				// https://gist.github.com/jonathantneal/3062955
				var ElementPrototype = window.Element.prototype;

				var matchesSelector = ElementPrototype.matchesSelector ||
				    ElementPrototype.mozMatchesSelector ||
				    ElementPrototype.msMatchesSelector ||
				    ElementPrototype.oMatchesSelector ||
				    ElementPrototype.webkitMatchesSelector ||
				    function (selector) {
				        var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;

				        while (nodes[++i] && nodes[i] != node);

				        return !!nodes[i];
				    }

				exports.matchesSelector = function( element, selector ) {
				    return matchesSelector.call( element, selector );
				}
			},
			"dynks.js": function (exports, module, require) {
				
				module.exports = function ( target, getCurrentValue, callback ) {

				    target.classList.add("dynks-enabled");

				    var options = {
				        gap: target.dataset.dynksGap || 5,
				        min: !isNaN(target.dataset.dynksMin) ? +target.dataset.dynksMin : -Infinity,
				        max: !isNaN(target.dataset.dynksMax) ? +target.dataset.dynksMax : +Infinity
				    };

				    target.addEventListener( "mousedown", function( mouseDownEvent ){
				        var initialPosition = mouseDownEvent.pageX;
				        var lastValue = Number( getCurrentValue() );
				        var lastSlot = 0;

				        function handleMouseMove( mouseMoveEvent ) {
				            var currentSlot = (mouseMoveEvent.pageX - initialPosition) / options.gap;
				            currentSlot = ~~currentSlot;

				            var slotDiff = currentSlot - lastSlot;

				            if (slotDiff !== 0) {
				                var multiplier = 1;
				                if (mouseMoveEvent.shiftKey) multiplier = 10;

				                var currentValue = lastValue + slotDiff * multiplier;

				                if (currentValue < options.min) {
				                    currentValue = options.min;
				                    target.classList.add("dynks-out-of-range");
				                } else if (currentValue > options.max) {
				                    currentValue = options.max;
				                    target.classList.add("dynks-out-of-range");
				                } else {
				                    target.classList.remove("dynks-out-of-range");
				                }

				                callback( currentValue );

				                if (lastValue != currentValue) {
				                    lastValue = currentValue;
				                    lastSlot = currentSlot;
				                }
				            }

				            mouseMoveEvent.preventDefault();
				        }

				        function handleMouseUp() {
				            target.classList.remove("dynks-active");
				            target.classList.remove("dynks-out-of-range");
				            document.documentElement.classList.remove("dynks-moving");
				            document.removeEventListener("mousemove", handleMouseMove, false );
				            document.removeEventListener("mouseup", handleMouseUp, false );
				        }

				        document.addEventListener( "mousemove", handleMouseMove, false );
				        document.addEventListener( "mouseup", handleMouseUp, false );

				        target.classList.add("dynks-active");
				        document.documentElement.classList.add("dynks-moving");

				        mouseDownEvent.preventDefault();
				    }, false );

				};

			},
			"ieee754.js": function (exports, module, require) {
				
				// float32ToOctets( 123.456 ) -> [ 66, 246, 233, 121 ]
				function float32ToOctets(number) {
				    var buffer = new ArrayBuffer(4);
				    new DataView(buffer).setFloat32(0, number, false);
				    return [].slice.call( new Uint8Array(buffer) );
				}

				// octetsToFloat32( [ 66, 246, 233, 121 ] ) -> 123.456
				function octetsToFloat32( octets ) {
				    var buffer = new ArrayBuffer(4);
				    new Uint8Array( buffer ).set( octets );
				    return new DataView( buffer ).getFloat32(0, false);
				}

				// float64ToOctets( 123.456 ) -> [ 64, 94, 221, 47, 26, 159, 190, 119 ]
				function float64ToOctets(number) {
				    var buffer = new ArrayBuffer(8);
				    new DataView(buffer).setFloat64(0, number, false);
				    return [].slice.call( new Uint8Array(buffer) );
				}

				// octetsToFloat64( [ 64, 94, 221, 47, 26, 159, 190, 119 ] ) -> 123.456
				function octetsToFloat64( octets ) {
				    var buffer = new ArrayBuffer(8);
				    new Uint8Array( buffer ).set( octets );
				    return new DataView( buffer ).getFloat64(0, false);
				}

				// intToBinaryString( 8 ) -> "00001000"
				function intToBinaryString( i, length ) {
				    length = length || 8;
				    for(i = i.toString(2); i.length < length; i="0"+i);
				    return i;
				}

				// binaryStringToInt( "00001000" ) -> 8
				function binaryStringToInt( b ) {
				    return parseInt(b, 2);
				}

				function octetsToBinaryString( octets ) {
				    return octets.map( function(i){ return intToBinaryString(i); } ).join("");
				}

				function float32ToBinaryString( number ) {
				    return octetsToBinaryString( float32ToOctets( number ) );
				}

				function binaryStringToFloat32( string ) {
				    return octetsToFloat32( string.match(/.{8}/g).map( binaryStringToInt ) );
				}

				function float64ToBinaryString( number ) {
				    return octetsToBinaryString( float64ToOctets( number ) );
				}

				function binaryStringToFloat64( string ) {
				    return octetsToFloat64( string.match(/.{8}/g).map( binaryStringToInt ) );
				}

				function toIEEE754F32Parsed(v) {
				    var string = octetsToBinaryString( float32ToOctets(v) );
				    var parts = string.match(/^(.)(.{8})(.{23})$/); // sign{1} exponent{8} fraction{23}

				    var bSign = parts[1];
				    var sign = Math.pow( -1, parseInt(bSign,2) );

				    var bExponent = parts[2];
				    var exponent = parseInt( bExponent, 2 );

				    var exponentNormalized = exponent - 127;
				    var bSignificand = parts[3];

				    var bHidden = (exponent === 0) ? "0" : "1";

				    return {
				        value: v,
				        bFull: bSign + bExponent + bHidden + bSignificand,
				        bSign: bSign,
				        bExponent: bExponent,
				        bHidden: bHidden,
				        bSignificand: bSignificand,
				        sign: sign,
				        exponent: exponent,
				        exponentNormalized: exponentNormalized,
				    };
				}

				function toIEEE754F64Parsed(v) {
				    var string = octetsToBinaryString( float64ToOctets(v) );
				    var parts = string.match(/^(.)(.{11})(.{52})$/); // sign{1} exponent{11} fraction{52}

				    var bSign = parts[1];
				    var sign = Math.pow( -1, parseInt(bSign,2) );

				    var bExponent = parts[2];
				    var exponent = parseInt( bExponent, 2 );

				    var exponentNormalized = exponent - 1023;
				    var bSignificand = parts[3];

				    var bHidden = (exponent === 0) ? "0" : "1";

				    return {
				        value: v,
				        bFull: bSign + bExponent + bHidden + bSignificand,
				        bSign: bSign,
				        bExponent: bExponent,
				        bHidden: bHidden,
				        bSignificand: bSignificand,
				        sign: sign,
				        exponent: exponent,
				        exponentNormalized: exponentNormalized,
				    };
				}

				module.exports = {
				    float64ToOctets: float64ToOctets,
				    octetsToFloat64: octetsToFloat64,
				    float32ToOctets: float32ToOctets,
				    octetsToFloat32: octetsToFloat32,
				    intToBinaryString: intToBinaryString,
				    binaryStringToInt: binaryStringToInt,
				    octetsToBinaryString: octetsToBinaryString,
				    float32ToBinaryString: float32ToBinaryString,
				    binaryStringToFloat32: binaryStringToFloat32,
				    float64ToBinaryString: float64ToBinaryString,
				    binaryStringToFloat64: binaryStringToFloat64,
				    toIEEE754F64Parsed: toIEEE754F64Parsed,
				    toIEEE754F32Parsed: toIEEE754F32Parsed
				};
			}
		}
	}
})("ieee754-visualization/src/bits");
