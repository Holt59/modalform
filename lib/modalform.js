(function ($) {

    "use strict";

    function ModalForm(dialog, options) {

        var modalForm = this;

        this.dialog = dialog;
        this.form = this.dialog.find('form');
        this.options = options;

        this.dialog.modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        });

        this.dialog.on('hidden.bs.modal', function () {
            modalForm.options.onHide();
        });

        this.form.submit(function () {
            modalForm.submit();
            return false;
        });

        this.form.find('input').on('keypress', function (event) {
            if (event.which == 13) {
                event.preventDefault();
                modalForm.submit();
            }
        });

        this.dialog.find('*[data-submit="modal-form"]').on('click', function () {
            modalForm.submit();
        });

        this.dialog.find('*[data-reset="modal-form"]').on('click', function () {
            modalForm.clear();
        });

    }

    ModalForm.prototype = {

        constructor: ModalForm,

        /**
        *
        * Check if the specified data is considered « checked ».
        *
        * @param data The data value to check
        *
        * @return true if the value is considered « checked »
        *
        **/
        isChecked: function (data) {
            return data !== undefined && parseInt(data) !== 0
                && data !== false && data.length !== 0;
        },

        /**
        *
        * Clear the form inputs.
        *
        * @param clearFiles Clear the input of type file or not (default true).
        *
        **/
        clear: function (clearFiles) {

            var modalForm = this;

            if (typeof clearFiles === 'undefined') {
                clearFiles = true;
            }

            this.form.find('input:not(.no-modalform), select:not(.no-modalform), textarea').each(function () {
                var name = modalForm.options.getFieldName($(this).attr('name'));
                if ($(this).attr('type') == 'checkbox') {
                    if (modalForm.isChecked(modalForm.options.defaultValues[name])) {
                        $(this).prop('checked', true);
                    }
                    else {
                        $(this).prop('checked', false);
                    }
                }
                else if ($(this).attr('type') == 'file' && !clearFiles) {

                }
                else {
                    $(this).val(modalForm.options.defaultValues[name]);
                }
                $(this).change();
                modalForm.removeError($(this));
            });

        },

        /**
        *
        * Clear and set new value to form inputs.
        *
        * @param data The new value (do not work on file input).
        * @param clearFiles See ModalForm.clear().
        *
        **/
        setValues: function (data, clearFiles) {

            var modalForm = this;

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

        },

        /**
        *
        * Retrieve the form input values as a FormData object.
        *
        * @return A FormData object containing the input values.
        *
        **/
        getValues: function () {

            var modalForm = this;

            var data = new FormData(); // Object () ;

            this.form.find('input:not(.no-modalform), select:not(.no-modalform), textarea').each(function () {
                var name = modalForm.options.getFieldName($(this).attr('name'));
                if ($(this).attr('type') == 'checkbox') {
                    data.append($(this).attr('name'), $(this).is(':checked') ? 1 : 0);
                }
                else if ($(this).attr('type') == 'file') {
                    if ($(this).prop('files').length > 0) {
                        data.append($(this).attr('name'), $(this).prop('files')[0]);
                    }
                }
                else {
                    data.append($(this).attr('name'), modalForm.options.inputToData(name, $(this).val(), $(this)));
                }
            });

            return data;

        },

        /**
        *
        * Update the form inputs with new values and errors.
        *
        * @param values {key: value} for each input.
        * @param errors {key: error} for each input with an error.
        *
        **/
        update: function (values, errors) {

            var modalForm = this;

            this.setValues(values, false);

            this.form.find('input:not(.no-modalform), select:not(.no-modalform)').each(function () {
                /* Update with new values if changed. */
                var name = modalForm.options.getFieldName($(this).attr('name'));
                /* Update if errors, just take the first error ! */
                if (errors[name]) {
                    modalForm.addError($(this), errors[name]);
                }
                else {
                    modalForm.removeError($(this));
                }
            });

        },

        /**
        * Start the spinner button.
        **/
        startSpinner: function () {
            this.dialog.find('*[data-submit="modal-form"]').spinner({
                style: 'zoom-in'
            }).spinner('start');
        },

        /**
        * Stop the spinner button.
        **/
        stopSpinner: function () {
            this.dialog.find('*[data-submit="modal-form"]').spinner('stop');
        },

        /**
        * 
        * Submit the form.
        *
        **/
        submit: function () {

            this.startSpinner();

            $.ajax({
                type: 'post',
                url: this.form.attr('action'),
                data: this.getValues(),
                context: this,
                processData: false,
                contentType: false,
                success: function (result) {
                    this.stopSpinner();
                    this.update(result.values, result.errors);
                    if (result.errors.length === 0) {
                        this.options.success(result.values);
                    }
                    else {
                        this.options.fail(result.values, result.errors);
                    }
                    this.form.find('input, select').blur();
                },
                complete: function () {
                    this.stopSpinner();
                },
                dataType: 'json'
            });

        },

        /**
        *
        * Show the modal.
        *
        * @param title If specified, change the the title to this arg.
        *
        **/
        show: function (title) {

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
        },

        /**
        *
        * Hide the modal form.
        *
        **/
        hide: function () {
            this.dialog.modal('hide');
        },

        /**
        *
        * Add errors to the specified input.
        *
        * @param input
        * @param errors
        *
        **/
        addError: function (input, errors) {

            if ($(this).is(':hidden')) {
                return;
            }

            this.removeError(input);

            var errorSpan = $('<span class="help-block modalform-error">' + errors[0] + '</span>');
            var inputSize = parseInt(input.parents('*[class^="col-md-"]:first').attr('class').match(/col-md-([0-9]+)/)[1]);
            errorSpan.addClass('col-md-offset-' + (12 - inputSize));
            errorSpan.addClass('col-md-' + inputSize);

            input.parents('.form-group').append(errorSpan);
            input.parents('.form-group').addClass('has-error');

        },

        /**
        *
        * Remove errors from the specified input.
        *
        * @param input
        *
        **/
        removeError: function (input) {
            input.parents('.form-group').find('.modalform-error').remove();
            input.parents('.form-group').removeClass('has-error');
        },

        /**
        *
        * Set the error on the specified input. This is simply a wrap around
        * addError and removeError.
        *
        * @param input
        * @param errors If false, remove errors from input, otherwise add them.
        *
        **/
        setError: function (input, error) {
            if (error === false) {
                this.removeError(input);
            }
            else {
                this.addError(input, [error]);
            }
        }

    };

    $.fn.modalform = function (options) {
        var args = arguments;
        return this.each(function () {
            if ($.isPlainObject(options)) {
                this.modalform = new ModalForm($(this), $.extend({}, $.fn.modalform.defaults, options));
            }
            else if (typeof options == 'string') {
                switch (options) {
                    case 'show':
                        this.modalform.show(args[1]);
                        break;
                    case 'hide':
                        this.modalform.hide();
                        break;
                    case 'error':
                        this.modalform.setError(args[1], args[2]);
                        break;
                    case 'clear':
                        this.modalform.clear();
                        break;
                    case 'setValues':
                        this.modalform.setValues(args[1]);
                        break;
                }
            }
        });
    };

    $.fn.modalform.defaults = {
        defaultValues: [],
        success: function (data) { },
        fail: function (data, error) { },
        onShow: function () { },
        onHide: function () { },
        inputToData: function (name, value, input) { return value; },
        dataToInput: function (name, data, input, allData) { return data; },
        getFieldName: function (name) { return name; }
    };

} (jQuery)); 