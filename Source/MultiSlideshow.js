;(function(){

var MultiSlideshow = this.MultiSlideshow = new Class({
    Implements: [Events, Options],
    defaultOptions: {
        autoplay: true,
        duration: 800,
        delay: 4000,
        transition: 'fade'
    },
    options: {},
    elements: [],
    slides: [],
    initialize: function(selector, options){
        this.elements = $$(selector);
        this.reset(options);
    },
    reset: function(options){
        this.options = this.defaultOptions;
        this.setOptions(options);
        var o = this.options;
        this.slides = [];
        this.elements.each(function(el, i){
            el = new MultiSlideshow.Instance(el, o);
            this.slides.push(el.slides);
        }.bind(this));
        this.fx = new Fx.Elements(this.slides);
        if(this.options.autoplay) this.play();
        return this;
    },
    play: function(){
        (function(){
            this.next();
        }.bind(this)).periodical(this.options.delay);
        return this;
    },
    next: function(){
        var slideConfigurations = {},
            slideConfigurationKey = 0;
        this.elements.each(function(el, i){
            var currentSlideConfigurations = el.retrieve('MultiSlideshowInstance').next();
            currentSlideConfigurations.each(function(slideConfiguration, i){
                slideConfigurations[slideConfigurationKey] = slideConfiguration;
                slideConfigurationKey++;
            });
        });
        this.fx.start(slideConfigurations);
        return this;
    }
});

MultiSlideshow.Instance = new Class({
    Implements: [Events, Options],
    defaultOptions: {
        transition: 'fade'
    },
    options: {},
    element: null,
    current: 0,
    initialize: function(element, options){
        this.element = document.id(element);
        this.reset(options);
    },
    reset: function(options){
        this.options = this.defaultOptions;
        this.setOptions(options);
        var o = this.options;
        this.slides = this.element.getChildren();
        this.slides.each(function(slide, i){
            slide = new MultiSlideshow.Slide(slide, o);
        }.bind(this));
        this.element.store('MultiSlideshowInstance', this);
        return this;
    },
    next: function(){
        var current = this.current = this.slides[this.current+1] ? this.current+1 : 0;
        var slideConfigs = [];
        this.slides.each(function(slide, i){
            slideConfigs.push(slide.retrieve('MultiSlideshowSlide').getConfig(current == i));
        });
        return slideConfigs;
    }
});

MultiSlideshow.Slide = new Class({
    Implements: [Events, Options],
    defaultOptions: {
        transition: 'fade'
    },
    options: {},
    element: null,
    current: false,
    initialize: function(element, options){
        this.element = document.id(element);
        this.reset(options);
    },
    reset: function(options){
        this.options = this.defaultOptions;
        this.setOptions(options);
        this.element.store('MultiSlideshowSlide', this);
        return this;
    },
    getConfig: function(isCurrent){
        var transition = MultiSlideshow.Transitions[this.options.transition];
        if(isCurrent){
            this.current = true;
            return transition.show();
        }
        if(this.current){
            this.current = false;
            return transition.hide();
        }
        return transition.background();
    }
});

MultiSlideshow.Transitions = {};

MultiSlideshow.Transitions.fade = {
    background: function(){
        return {
            'z-index': 0,
            'opacity': 1
        };
    },
    hide: function(){
        return {
            'z-index': 1,
            'opacity': 1
        };
    },
    show: function(){
        return {
            'z-index': 2,
            'opacity': [0, 1]
        };
    }
};


})();