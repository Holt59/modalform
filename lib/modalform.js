function ModalForm (dialog, options) {

	var modalForm = this ;

	this.dialog = dialog ;
	this.form = this.dialog.find('form') ;
	this.options = options ;

	this.dialog.modal({
	    backdrop: 'static',
	    keyboard: false,
	    show: false
    });
    
    this.dialog.on('hidden.bs.modal', function () {
        modalForm.options.onHide () ;
    }) ;

	this.form.submit(function () {
		modalForm.submit() ;
		return false ;
	}) ;
    
    this.form.find('input').on('keypress', function (event) {
        if (event.which == 13) {
            event.preventDefault();
            modalForm.submit () ;
        }
    }) ;
	
	this.dialog.find('*[data-submit="modal-form"]').on('click', function () {
		modalForm.submit() ;
	}) ;
    
    this.dialog.find('*[data-reset="modal-form"]').on('click', function () {
        modalForm.clear() ;
    }) ;

    this.isChecked = function (data) {
        return data !== undefined && parseInt(data) !== 0 
            && data !== false && data.length !== 0;
    } ;
    
	this.clear = function (clearFiles) {

        if (typeof clearFiles === 'undefined') {
            clearFiles = true ;
        }
    
		this.form.find('input:not(.no-modalform), select:not(.no-modalform), textarea').each(function () {
			var name = modalForm.options.getFieldName($(this).attr('name')) ;
			if ($(this).attr('type') == 'checkbox') {
				if (modalForm.isChecked(modalForm.options.defaultValues[name])) {
                    $(this).prop('checked', true) ;
                }
                else {
                    $(this).prop('checked', false) ;
                }
			}
            else if ($(this).attr('type') == 'file' && !clearFiles) {
            
            }
			else {
				$(this).val(modalForm.options.defaultValues[name]) ;
			}
            $(this).change() ;
			modalForm.removeError ($(this)) ;
		}) ;
			
	} ;

	this.setValues = function (data, clearFiles) {

	    this.clear(clearFiles);

	    this.form.find('input:not(.no-modalform), select:not(.no-modalform), textarea').each(function () {
	        var name = modalForm.options.getFieldName($(this).attr('name'));
	        if ($(this).attr('type') == 'checkbox') {
	            if (modalForm.isChecked(data[name])) {
	                $(this).prop('checked', true);
	            }
	            else {
	                $(this).prop('checked', false);
	            }
	        }
	        else if ($(this).attr('type') == 'file') {

	        }
	        else {
	            $(this).val(modalForm.options.dataToInput(name, data[name], $(this), data));
	        }
	        $(this).change();
	    });

	};

	this.getValues = function () {
	
		var data = new FormData() ; // Object () ;
	
		this.form.find('input:not(.no-modalform), select:not(.no-modalform), textarea').each(function () {
			var name = modalForm.options.getFieldName($(this).attr('name')) ;
			if ($(this).attr('type') == 'checkbox') {
				data.append($(this).attr('name'), $(this).is(':checked') ? 1 : 0) ;
			}
            else if ($(this).attr('type') == 'file') {
                if ($(this).prop('files').length > 0) {
                    data.append($(this).attr('name'), $(this).prop('files')[0]) ;
                }
            }
			else {
				data.append($(this).attr('name'), modalForm.options.inputToData(name, $(this).val(), $(this))) ;
			}
		}) ;

		return data ;

	} ;

	this.update = function (values, errors) {
        
        this.setValues(values, false) ;
	
		this.form.find('input:not(.no-modalform), select:not(.no-modalform)').each(function () {
			/* Update with new values if changed. */
			var name = modalForm.options.getFieldName($(this).attr('name')) ;
			/* Update if errors, just take the first error ! */
			if (errors[name]) {
                modalForm.addError($(this), errors[name]) ;
			}
			else if (modalForm.hasError($(this))) {
                modalForm.removeError ($(this)) ;
			}
		}) ;

	} ;

	this.showLoadBar = function () {
	    this.dialog.find('*[data-submit="modal-form"]').spinner({
	        style: 'zoom-in'
	    }).spinner('start');
	};

	this.hideLoadBar = function () {
	    this.dialog.find('*[data-submit="modal-form"]').spinner('stop');
	};

	this.submit = function () {

	    this.showLoadBar();

	    $.ajax({
	        type: 'post',
	        url: this.form.attr('action'),
	        data: this.getValues(),
	        context: this,
	        processData: false,
	        contentType: false,
	        success: function (result) {
                this.hideLoadBar();
	            this.update(result.values, result.errors);
	            if (result.errors.length === 0) {
	                this.options.success(result.values);
	            }
	            else {
	                this.options.fail(result.values, result.errors);
	            }
	            modalForm.form.find('input, select').blur();
	        },
	        complete: function () {
	            this.hideLoadBar();
	        },
            dataType: 'json'
	    });

	};

	this.show = function (title) {

	    if (typeof title !== 'undefined') {
	        this.dialog.find('.modal-header h4').html(title);
	    }

	    this.dialog.modal('show');

	    this.dialog.on('shown', function () {
	        $(this).find('.modal-body').scrollTop(0);
	    });

	    this.options.onShow();

	    this.dialog.on('shown', function () {
	        $(this).find('form').find('input:visible, select:visible').first().focus();
	    });
	};

	this.hide = function () {
        this.dialog.modal('hide');
	};

	this.addError = function (input, errors) {

	    if ($(this).is(':hidden')) {
	        return;
	    }

	    console.log(input);

	    this.removeError(input);

	    var errorSpan = $('<span class="help-block modalform-error">' + errors[0] + '</span>');
	    var inputSize = parseInt(input.parents('*[class^="col-md-"]:first').attr('class').match(/col-md-([0-9]+)/)[1]);
	    errorSpan.addClass('col-md-offset-' + (12 - inputSize));
	    errorSpan.addClass('col-md-' + inputSize);

	    input.parents('.form-group').append(errorSpan);
	    input.parents('.form-group').addClass('has-error');

	};

    this.hasError = function (input) {
        
    },
    
    this.removeError = function (input) {
        input.parents('.form-group').find('.modalform-error').remove() ;
        input.parents('.form-group').removeClass('has-error') ;
    } ;
    
    this.setError = function (input, error) {
        if (error === false) {
            this.removeError(input) ;
        }
        else {
            this.addError(input, [error]) ;
        }
    }
    
}

(function ($) {
 
    $.fn.modalform = function(options) {
		var args = arguments ;
		return this.each(function () {
			if ($.isPlainObject(options)) {
				this.modalform = new ModalForm($(this), $.extend({}, $.fn.modalform.defaults, options)) ;
			}
			else if (typeof options == 'string') {
				switch (options) {
				case 'show':
					this.modalform.show(args[1]) ;
					break ;
				case 'hide':
					this.modalform.hide() ;
					break ;
                case 'error':
                    this.modalform.setError(args[1], args[2]) ;
                    break ;
				case 'clear':
					this.modalform.clear() ;
					break ;
				case 'setValues':
					this.modalform.setValues(args[1]) ;
					break ;
				}
			}
		}) ;
    };
	
	$.fn.modalform.defaults = {
		defaultValues: new Array(),
		height: false,
		success: function (data) { },
		fail: function (data, error) { },
        onShow: function () { },
        onHide: function () { },
		inputToData: function (name, value) { return value ; },
		dataToInput: function (name, data) { return data ; },
        getFieldName: function (name) { return name ; }
	} ;
 
} (jQuery)); 