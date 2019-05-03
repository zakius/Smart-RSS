/**
 * @module App
 * @submodule views/IndicatorView
 */
define(['backbone', 'modules/Locale', 'text!templates/indicator.html'], function (BB, Locale, tplIndicator) {

    /**
     * Feeds update indicator view
     * @class IndicatorView
     * @constructor
     * @extends Backbone.View
     */
    var IndicatorView = BB.View.extend({
        /**
         * Indicator element id
         * @property id
         * @default indicator
         */
        id: 'indicator',

        events: {
            'click #indicator-stop': 'handleButtonStop'
        },

        /**
         * @method initialize
         */
        initialize: function () {
            this.loaded = 0;
            this.maxSources = 0;
            const fragment = document.createRange().createContextualFragment(tplIndicator);
            this.el.appendChild(fragment);
            const browser = window.browser || window.chrome;
            let port = browser.runtime.connect({ name: 'port-from-cs' });
            port.onMessage.addListener((m) => {
                if (m.key === 'loading') {
                    this.handleLoadingChange();
                }
                if (m.key === 'loaded') {
                    this.loaded = m.value;
                    this.render();
                }
                if (m.key === 'maxSources') {
                    this.maxSources = m.value;
                    this.render();
                }

            });
            bg.sources.on('clear-events', this.handleClearEvents, this);

            this.render();
        },

        /**
         * Clears bg events it listens to
         * @method handleClearEvents
         * @param id {Integer} ID of the closed tab
         */
        handleClearEvents: function (id) {
            if (window == null || id === tabID) {
                // bg.loader.removeEventListener('loadingChanged', this.handleLoadingChange);
                // bg.loader.removeEventListener('loadedChanged', this.render);
                // bg.loader.removeEventListener('maxSourcesChanged', this.render);
                bg.sources.off('clear-events', this.handleClearEvents, this);
            }
        },

        /**
         * Stops updating feeds
         * @method handleButtonStop
         * @triggered when user clicks on stop button
         */
        handleButtonStop: function () {
            app.actions.execute('feeds:stopUpdate');
        },

        /**
         * Hides/shows indicator according to loading flag
         * @method handleLoadingChange
         */
        handleLoadingChange: function () {
            const value2 = bg.loader.loading;
            if (value2) {
                this.render();
                this.el.classList.add('indicator-visible');
            } else {
                setTimeout(() => {
                    this.el.classList.remove('indicator-visible');
                }, 500);
            }
        },

        /**
         * Renders the indicator (gradient/text)
         * @method render
         * @chainable
         */
        render: function () {
            const { loaded, maxSources } = this;
            if (maxSources === 0) {
                return;
            }
            const percentage = Math.round(loaded * 100 / maxSources);
            this.el.querySelector('#indicator-progress').style.background = 'linear-gradient(to right,  #c5c5c5 ' + percentage + '%, #eee ' + percentage + '%)';
            this.el.querySelector('#indicator-progress').textContent = Locale.UPDATING_FEEDS + ' (' + loaded + '/' + maxSources + ')';
            return this;
        }
    });

    return IndicatorView;
});
