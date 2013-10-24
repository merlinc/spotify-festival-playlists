require([
  '$api/models',
  '/strings/main.lang'
], function(models, mainStrings) {
  'use strict';

  //Setup a short-hand to get translation
  var _ = SP.bind(mainStrings.get, mainStrings);

  var applyLanguages = function() {
    document.querySelector('[data-i18n-title]').textContent = _('title');
    document.querySelector('[data-i18n-heading]').textContent = _('title');
    document.querySelector('[data-i18n-offline]').innerHTML = _('offline');
    document.querySelector('[data-i18n-offline-message]').innerHTML = _('offline_message');
    document.querySelector('[data-i18n-festivals-heading]').textContent = _('festivals_heading');
    document.querySelector('[data-i18n-festivals-filter]').placeholder = _('festivals_filter');
    document.querySelector('[data-i18n-festivals-load]').textContent = _('festivals_load');
    document.querySelector('[data-i18n-stages-heading]').textContent = _('stages_heading');
    document.querySelector('[data-i18n-stages-filter-all]').textContent = _('stages_filter_all');
    document.querySelector('[data-i18n-stages-filter-none]').textContent = _('stages_filter_none');
    document.querySelector('[data-i18n-stages-load]').textContent = _('stages_load');
    document.querySelector('[data-i18n-tracks-heading]').textContent = _('tracks_heading');

  };

  exports.applyLanguages = applyLanguages;
});
