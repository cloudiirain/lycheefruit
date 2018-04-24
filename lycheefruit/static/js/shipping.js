$(document).ready(function () {
  $('#submit').click(function() {
    var mode = $("input[type='radio'][name='rarity']:checked").val();
    var vol_input = parseFloat($('#volume').val());
    var vol_unit = $('#volume_units').val();
    var weight_input = parseFloat($('#weight').val());
    var weight_unit = $('#weight_units').val();

    // Convert units, weight to lbs, volume to cu mtr
    switch(vol_unit) {
      case 'in':
        vol_input = vol_input / 61023.7;
        break;
      case 'cm':
        vol_input = vol_input / 1000000.0;
        break;
      case 'mtr':
        break;
      case 'ft':
        vol_input = vol_input / 35.3147;
        break;
    }
    switch(weight_unit) {
      case 'lbs':
        break;
      case 'kg':
        weight_input = weight_input * 2.20462;
        break;
      case 'oz':
        weight_input = weight_input / 16.0;
        break;
    }

    // Multiple total volume by a factor to simulate packing inefficiency
    vol_input = vol_input / 0.7;

    // Compute common leg prices
    var common_weight_price = 2.3204 * weight_input + 25.318;
    var common_vol_price = vol_input >= 1 ? vol_input * 182.58 + 59.46 : 242.04;

    // Compute rare leg prices
    if (mode === 'rare') {
      common_weight_price += 5.2689 * weight_input + 22.442;
      common_vol_price += vol_input >= 1 ? vol_input * 186 + 8.5 : 194.5;
    }

    // Compare freight vs parcel shipping for best value
    if (common_weight_price > common_vol_price) {
      $('#volume').addClass('is-valid');
      $('#cost').val('$' + common_vol_price.toFixed(2));
    } else {
      $('#weight').addClass('is-valid');
      $('#cost').val('$' + common_weight_price.toFixed(2));
    }
  });
  $('#reset').click(function() {
    $('#volume').val('');
    $('#weight').val('');
    $('#cost').val('');
    $('#volume').removeClass('is-valid');
    $('#weight').removeClass('is-valid');
  });
  $('#reset').on('keydown', function (e) {
    // Force tab order to cycle
    if ((e.which === 9 && !e.shiftKey)) {
      e.preventDefault();
      $('#common').focus();
    }
  });
  $('input').change(function() {
    $('#volume').removeClass('is-valid');
    $('#weight').removeClass('is-valid');
  });
});
