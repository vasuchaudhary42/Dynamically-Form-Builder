Object.prototype.traverse = function(object, callback) {
    Object.keys(object).forEach((key) => {
        callback(key, object[key]);
    });
};
Object.prototype.forEach  = function(callback) {
    Object.keys(this).forEach((key) => {
        callback(key, this[key]);
    });
};
Object.prototype.contains = function(key) {
    return key in this && typeof this[key] !== 'undefined';
}
Object.prototype.some = function(callback) {
    return Object.keys(this).some(key => callback(key, this[key]));
};
Object.prototype.find = function(callback) {
    const key = Object.keys(this).find(key => callback(key, this[key]));
    return this[key];
}

Array.prototype.insertAt  = function (index, ...elements) {
    this.splice(index, 0, ...elements);
    return this;
};
Array.prototype.removeAt  = function (index, count = 1) {
    this.splice(index, count);
    return this;
}
HTMLElement.prototype.appendText = function (text) {
    this.innerText += '\n' + text;
    return this;
}
HTMLElement.prototype.removeText = function () {
    this.innerText = '';
    return this;
}

const Validators  = {

    ERROR_MESSAGE: {
        Required:              'Field should be required!',
        CurrencyValidator:     'Currency should be valid!',
        NumberValidator:       'value should be number type',
        LengthValidator:       (value, length)               => `Length should be equals to ${length}`,
        MinLengthValidator:    (value, minLength)            => `Length should be greater or equals then ${minLength}`,
        MaxLengthValidator:    (value, maxLength)            => `Length should be less or equals then ${maxLength}`,
        MinValidator:          (value, minValue)             => `Value should be greater or equals then ${minValue}`,
        MaxValidator:          (value, maxValue)             => `Value should be less or equals then ${maxValue}`,
        MinMaxValidator:       (value, minValue, maxValue)   => `Value should be greater or equals then ${minValue} and less or equals then ${maxValue}`,
        MinMaxLengthValidator: (value, minLength, maxLength) => `Length should be greater or equals then ${minLength} and less or equals then ${maxLength}`,
    },
    WEIGHT_UNITS: ['oz', 'g', 'kg', 'lb'],
    min(minValue)
    {
        return value => {
            if (value >= minValue){
                return { valid: true, errors: [] }
            }else {
                return {
                    valid: false,
                    errors: [ Validators.ERROR_MESSAGE.MinValidator(value, minValue) ]
                }
            }
        };
    },
    max(maxValue)
    {
        return value => {
            if (value <= maxValue){
                return { valid: true, errors: [] }
            }else {
                return {
                    valid: false,
                    errors: [ Validators.ERROR_MESSAGE.MaxValidator(value, maxValue) ]
                }
            }
        };
    },
    number(value)
    {
        if (!isNaN(parseInt(value))){
            return { valid: true, errors: [] }
        }else {
            return {
                valid: false,
                errors: [ Validators.ERROR_MESSAGE.NumberValidator ]
            }
        }
    },
    required(value)
    {
        if (value !== '' && typeof value !== 'undefined' && value !== null){
            return { valid: true, errors: [] }
        }else {
            return {
                valid: false,
                errors: [ Validators.ERROR_MESSAGE.Required ]
            }
        }
    },
    minLength(minLength) {
        return value => {
            if ( minLength <= value.length()){
                return { valid: true, errors: [] }
            }else {
                return {
                    valid: false,
                    errors: [ Validators.ERROR_MESSAGE.MinLengthValidator(value, minLength) ]
                }
            }
        }
    },
    maxLength(maxLength) {
        return value => {
            if (maxLength >= value.length()){
                return { valid: true, errors: [] }
            }else {
                return {
                    valid: false,
                    errors: [ Validators.ERROR_MESSAGE.MaxLengthValidator(value, maxLength) ]
                }
            }
        }
    },
    length(length) {
        return value => {
            if (length === value.length()){
                return { valid: true, errors: [] }
            }else {
                return {
                    valid: false,
                    errors: [ Validators.ERROR_MESSAGE.MinLengthValidator(value, length) ]
                }
            }
        }
    },
    minMax(min, max) {
        return value => {
            if (value <= max && value >= min){
                return { valid: true, errors: [] }
            }else {
                return {
                    valid: false,
                    errors: [ Validators.ERROR_MESSAGE.MinMaxValidator(value, min, max) ]
                }
            }
        }
    },
    minMaxLength(minLength, maxLength) {
        return value => {
            const length = value.length();
            if (length <= maxLength && length >= minLength){
                return { valid: true, errors: [] }
            }else {
                return {
                    valid: false,
                    errors: [ Validators.ERROR_MESSAGE.MinMaxLengthValidator(value, minLength, maxLength) ]
                }
            }
        }
    }
};

const ErrorHandler = {

    /**
     *
     * @param {AbstractControl} abstractControl
     * @param {Array<String>}   errors
     */
    show(abstractControl, errors) {

        const element = abstractControl.errorElement;

        if (element !== null && element instanceof HTMLElement){
            element.removeText();
            errors.forEach(error =>  element.appendText(error));
        }

    },

    /**
     *
     * @param { AbstractControl } abstractControl
     */
    hide(abstractControl) {

        const element = abstractControl.errorElement;

        if (element !== null && element instanceof HTMLElement){
            element.removeText();
        }
    }
}
class Element{
    constructor(props) {
        this.props = props;
        this.elememt = document.querySelector(props.selector);
        this.type = null;
        this.eventHandler = {};
    }

    /**
     *
     * @param eventName {string}
     * @param callback {CallableFunction}
     * @return {Element}
     */
    on(eventName, callback){
        this.elememt.addEventListener(eventName, callback);
        this.eventHandler[eventName] = callback;
        return this;
    }

    /**
     *
     * @param eventName {string}
     * @param callback {CallableFunction}
     * @return {Element}
     */
    off(eventName, callback = null) {
        this.elememt.removeEventListener(eventName, callback === null ? this.eventHandler[eventName] : callback);
        delete this.eventHandler[eventName];
        return this;
    }

    /**
     *
     * @param listeners {{eventName: string, callback: CallableFunction}}
     */
    addListeners(listeners){
        const traverser = (eventName, callback) => {
            this.on(eventName, callback);
        }
        listeners.forEach(traverser);
        return this;
    }

    get value() {


        if (this.elememt === null || !(this.elememt instanceof HTMLElement)){
            return null;
        }

        if (this.elememt instanceof HTMLInputElement && this.elememt.type === 'checkbox'){
            return this.elememt.checked;
        } else if (this.elememt instanceof HTMLTextAreaElement || this.elememt instanceof HTMLInputElement || (this.elememt instanceof HTMLSelectElement && !this.elememt.multiple)){
            return this.elememt.value;
        }else if (this.elememt instanceof HTMLSelectElement){
            const selectedOptions = [];
            this.elememt.selectedOptions.forEach(option => selectedOptions.push(option.value));
            return selectedOptions;
        }

        return null;
    }

    set value(value) {

        if (this.elememt === null || !(this.elememt instanceof HTMLElement)){
            return;
        }

        if (this.elememt instanceof HTMLInputElement && this.elememt.type === 'checkbox'){
            this.elememt.checked = true;
        } else if (this.elememt instanceof HTMLTextAreaElement || this.elememt instanceof HTMLInputElement || (this.elememt instanceof HTMLSelectElement && !this.elememt.multiple)){
            this.elememt.value = value;
        }else if (this.elememt instanceof HTMLSelectElement){
            this.elememt.options.forEach(option => option.selected = value.contains(option.value))
        }
    }
}


class FormBuilder {

    constructor(props) {
        this.props = Object.assign({
            onValidStateChange: null,
            onChange: null,
            onReset: null,
            onReady: null,
            formSelector: null,
            submitButtonSelector: null,
            resetButtonSelector: null,
            isValid: false,
            storeInitialFormData: true,
            valid: this.props.isValid,
            formDataChanged: false,
        }, props);

        this.formGroupContext = {};
    }


    group(context){
        return new FormGroup(context);
    }

    array(props, state = {}){
        return new FormArray(props, state);
    }

    control(props, state = {}){
        return new FormControl(props, state);
    }


    isValid(showError = true) {

        this.formGroupContext.forEach((key, value) => {

            if(value instanceof FormArray){
                /**  @type { FormArray } */
                const formArray = this.formGroupsContext[formControlName];
                if(!formArray.isFormArrayValid(showError)){
                    this.state.isValid = false;
                    if(!showError)
                        return false;
                }
            } else if(this.formGroupsContext[formControlName] instanceof  FormControl){
                /**  @type { FormControl } */
                const formControl = this.formGroupsContext[formControlName];
                if(!formControl.isFormControlValid(showError)){
                    this.state.isValid = false;
                    if(!showError)
                        return false;
                }
            }else {
                this.state.isValid = false;
                return false;
            }
        });

        const formControlNames = Object.keys(this.formGroupsContext);

        let hasError = false;


        this.state.isValid = true;
        return true;
    }

    storeInitialFormData(initialFormData = null) {
        this.state.initialFormData = initialFormData || this.getFormData();
        return this;
    }

    getFormData() {

        const data = {};

        this.formGroupContext.forEach((key, value) => {
            if(value instanceof FormArray){
                data[key] = value.getFormArrayData();
            } else if(value instanceof  FormControl){
                data[key] = value.getValue();
            }
        });

        return data;
    }
}

class AbstractControl {

    /**
     *
     * @param {Array<function>} validators
     * @param options
     */
    constructor(validators, options) {
        this.validators = validators;

        this.options = Object.assign({
            errorElementSelector: null,
            errorHandler: null,
            isHandleErrors: true,
            errors: [],
            valid:  true
        }, options);

        this.state = {
            formState: null,
            isValid: true
        };
    }

    set formState(formState)
    {
        this.state.formState = formState;
        return this;
    }

    get formState()
    {
        return this.state.formState;
    }

    get isValid()
    {
        return this.state.formState;
    }

    set isValid(isValid)
    {
        this.state.isValid = isValid;
    }


    setParentControl(abstractControl)
    {
        this.parentControl = abstractControl;
        return this;
    }

    getParentControl()
    {
        return this.parentControl;
    }

    updateParent()
    {
        this.getParentControl().update(this);
        return this;
    }

    /**
     *
     * @return {HTMLElement|null}
     */
    get errorElement()
    {
        return document.querySelector(this.options.errorElementSelector);
    }

    get errorHandler() {
        return this.options.errorHandler || ErrorHandler;
    }

    get errors() {
        return this.options.errors;
    }

    validate(showError = true) {

        const hasErrors = this.validators.some(validator => {
            const { valid, errors } = validator(this.value);
            this.options.errors = errors;
            return !valid;
        });

        this.options.isValid = !hasErrors;

        if (this.options.isHandlerErrors){
            if (hasErrors){
                if (showError){
                    this.errorHandler.show(this, this.errors);
                }
            }else {
                this.errorHandler.hide(this);
            }
        }

        return !hasErrors;
    }

    storeValidationState()
    {

    }

    setValidators(validators)
    {
        this.validators = validators;
        return this;
    }

    addValidators(...validators){
        this.validators.concat(...validators)
        return this;
    }

    removeValidators(callback){
        this.validators.filter(validator => callback(validator));
        return this;
    }

}


class FormGroup extends AbstractControl{

    /**
     *
     * @param controlsConfig
     * @param validators
     * @param options
     */
    constructor(controlsConfig, validators, options) {

        super(validators, Object.assign({
            onReady: null,
            onFormStateChange: null,
            onFormValueChange: null,
            defaultValue: null,
            formValue: null
        }, options));

        this.controls  = this.parse(controlsConfig);
    }

    /**
     *
     * @param controlsConfig
     * @return {Object<string, AbstractControl>}
     */
    parse(controlsConfig)
    {

        const abstractControls = {};

        controlsConfig.forEach((formControlName, abstractControlConfig) => {
            if (abstractControlConfig instanceof AbstractControl){

                abstractControls[formControlName] = abstractControlConfig instanceof FormArray ? abstractControlConfig.parse() : abstractControlConfig;
                abstractControls[formControlName].parentControl = this;

            }else if (Array.isArray(abstractControlConfig)){

                abstractControls[formControlName] = new FormControl(abstractControlConfig[0] || [], abstractControlConfig[1] || {})
                abstractControls[formControlName].parentControl = this;
            }
        });

        return abstractControls;
    }

    init()
    {
        this.storeFormValue();
        this.checkValidation(false);

        if (this.options.isReady !== null && this.options.isReady instanceof Function) {
            this.options.isReady(this, this.isValid);
        }

        return this;
    }

    storeFormValue()
    {
        this.controls.forEach((formControlName, abstractControl) => abstractControl.storeFormValue());
        return this;
    }


    checkValidation(showError = true)
    {

        let state = true;

        this.controls.forEach((formControlName, abstractControl) => {

            if (!abstractControl.checkValidation(showError).isValid){
                state = false;
            }
        });

        this.isValid = isValid && this.validate(false);
        return this;
    }

    getFormValue()
    {
        const data = {};
        this.controls.forEach((formControlName, abstractControl) => data[formControlName] = abstractControl.getValue());

        return data;
    }

    triggerFormStateChange()
    {
        if (this.options.onFormStateChange instanceof Function)
            this.options.onFormStateChange(this, this.isValid);
        return this;
    }

    triggerFormValueChange(abstractControl)
    {
        if (this.options.onFormValueChange instanceof Function)
            this.options.onFormValueChange(this, abstractControl);
        return this;
    }

    isFormValueChanged()
    {
        return this.controls.some((formControlName, abstractControl) => abstractControl.isFormValueChanged());
    }

    isFormValid()
    {
        this.checkValidation(false);
        return this.isValid;
    }

    get(name)
    {
        return this.contains(name) ? this.controls[name] : null;
    }

    addControl(name, abstractControl)
    {
        if(abstractControl instanceof AbstractControl)
        {
            this.controls[name] = abstractControl;
            abstractControl.storeFormValue();
            this.refreshForm();

        }else {
        }
        return this;
    }

    removeControl(name)
    {
        delete this.controls[name];
        this.refreshForm();
        return this;
    }

    setControl(name, control)
    {
        this.controls[name] = control;
        this.refreshForm();
        return this;
    }

    contains(name)
    {
        return this.controls.contains(name);
    }

    patchValue(name, value)
    {
        if (this.controls.contains(name)){
            this.controls[name].patchValue(value);
            this.refreshForm();
        }

        return this;
    }

    reset()
    {
        this.controls.forEach((formControlName, abstractControl) => abstractControl.reset());
        this.refreshForm();
        return this;
    }

    getRawValue()
    {
        return this.getFormValue();
    }

    onAbstractControlUpdate(formControl, formArray)
    {
        const state = this.isValid;
        this.isFormValid();
        this.triggerFormValueChange(formControl);
        this.triggerFormStateChange();
        return this;
    }
}

class FormArray extends AbstractControl{

    constructor(controlsConfig, validators, options) {
        super(validators, options);

        /**
         *
         * @type {Array<AbstractControl>}
         */
        this.controls = this.parse(controlsConfig);
    }

    /**
     *
     * @param {Array<Array | AbstractControl>} controlsConfig
     * @return {Array<AbstractControl>}
     */
    parse(controlsConfig)
    {

        const abstractControls = [];

        controlsConfig.forEach( abstractControlConfig => {

            if (abstractControlConfig instanceof AbstractControl){

                abstractControlConfig.parentControl = this;
                abstractControls.push(abstractControlConfig);

            }else if (Array.isArray(abstractControlConfig)){

                const formControl = new FormControl(abstractControlConfig[0] || [], abstractControlConfig[1] || {})
                formControl.parentControl = this;
                abstractControls.push(formControl);
            }
        });

        return abstractControls;
    }

    storeFormValue() {
        this.controls.forEach(abstractControl => abstractControl.storeFormValue());
        return this;
    }

    checkValidation(showError = true)
    {
        this.state.isValid = this.validate(showError) && !this.controls.some(abstractControl => !abstractControl.checkValidation().isValid);
        return this;
    }

    getValue() {
        return this.controls.map(abstractControl => abstractControl.getValue());
    }

    isFormValueChanged()
    {
        return this.controls.some(abstractControl => abstractControl.isFormValueChanged());
    }

    refreshForm()
    {
        const currentState = this.isValid;

        this.isValid = this.checkValidation();

        if (currentState === this.isValid){
            this.onValidStateChange();
        }

        this.updateParent(this);

        return this;
    }


    onValidStateChange()
    {
        if (this.options.onValidStateChange && this.options.onValidStateChange instanceof Function){
            this.options.onValidStateChange(this);
        }

        return this;
    }


    get onChangeListener()
    {
        return this.options.onChangeListener || null;
    }

    get onClickListener()
    {
        return this.options.onClickListener || null;
    }



    at(index) {
        return this.controls[index];
    }

    push(control) {
        this.props.controls.push(control);
        return this;
    }

    insertAt(index, control){
        this.props.controls.insertAt(index, control);
        return this;
    }

    removeAt(index){
        this.props.controls.removeAt(index);
        return this;
    }

    setControl(index, control){
        this.props.controls[index] = control;
        return this;
    }

    reset() {
        this.controls.map(abstractControl => abstractControl.reset());
        return this;
    }
}

class FormControl extends AbstractControl{

    constructor(validators, options) {

        super(validators, options);

        this.elememt   = new Element({
            selector: options.selector,
        });

        this.bindEventListeners();
    }

    storeFormValue() {
        this.state.formState = this.elememt.value;
        return this;
    }

    checkValidation(showError = true)
    {
        this.state.isValid = this.validate(showError);
        return this;
    }

    getValue()
    {
        return this.elememt instanceof HTMLElement ? this.elememt.value : this.formState;
    }

    isFormValueChanged()
    {
        return this.formState !== this.getValue();
    }

    setValue(value, options = {}){
        this.elememt.value = value;
        this.onValueChange({ event: 'setValue' });
        return this;
    }

    onValueChange(event)
    {
        this.refreshForm();

        if (this.options.onValueChange && this.options.onValueChange instanceof Function){
            this.options.onValueChange(event, this);
        }

        return this;
    }

    onValidStateChange()
    {
        if (this.options.onValidStateChange && this.options.onValidStateChange instanceof Function){
            this.options.onValidStateChange(this);
        }

        return this;
    }

    refreshForm()
    {
        const currentState = this.isValid;

        this.isValid = this.checkValidation();

        if (currentState === this.isValid){
            this.onValidStateChange();
        }

        this.updateParent(this);

        return this;
    }

    bindEventListeners() {
        if (this.elememt && this.elememt instanceof HTMLElement)
            this.elememt.on('change', this.onValueChange.bind(this));
        return this;
    }

    patchValue(value, options = {}){
        this.elememt.value = value;
        return this;
    }

    reset() {
        this.elememt.value = this.formState;
        this.refreshForm();
        return this;
    }

}

export class FormBuilder1 {
    constructor(props) {
        /** @type {Object<string, FormControl|FormArray>} */
        this.formGroupsContext = {};

        /** @type {ValidationService} */
        this.validationService = new ValidationService();
        this.props = {
            subscribers: {},
            isValid: true,
            storeInitialFormData: true
        };

        this.props = Object.assign(this.props, props);
        this.state = {
            isValid: this.props.isValid,
            isFormDataChanged: false
        }
    }

    /**
     * @param {Object<string, FormControl|FormArray>} formGroupsContext
     */
    group(formGroupsContext) {
        this.formGroupsContext = formGroupsContext;
        if (this.props.storeInitialFormData)
            this.storeInitialFormData();
        return this;
    }

    isFormValid(showError = true) {

        const formControlNames = Object.keys(this.formGroupsContext);

        let hasError = false;

        for (let i = 0; i < formControlNames.length; i++){
            const formControlName = formControlNames[i];

            if(this.formGroupsContext[formControlName] instanceof FormArray){
                /**  @type { FormArray } */
                const formArray = this.formGroupsContext[formControlName];
                if(!formArray.isFormArrayValid(showError)){
                    this.state.isValid = false;
                    if(!showError)
                        return false;
                }
            } else if(this.formGroupsContext[formControlName] instanceof  FormControl){
                /**  @type { FormControl } */
                const formControl = this.formGroupsContext[formControlName];
                if(!formControl.isFormControlValid(showError)){
                    this.state.isValid = false;
                    if(!showError)
                        return false;
                }
            }else {
                this.state.isValid = false;
                return false;
            }
        }

        this.state.isValid = true;
        return true;
    }

    /**
     * @return {FormBuilder}
     */
    storeInitialFormData(data = null) {
        this.state['initialFormData'] = data || this.getFormData();
        return this;
    }

    getStoredInitialFormData() {
        return this.state['initialFormData'];
    }

    isFormDataChanged(formData = null) {
        if(formData === null)
            formData = this.getFormData();

        if(this.state['initialFormData']){
            return this.isDataChanged(this.state['initialFormData'], formData)
        }
        return false;
    }

    isDataChanged(oldData, newData) {

        if(typeof  oldData === 'object' ) {
            const formControlNames = Object.keys(oldData);
            const len = formControlNames.length;

            for (let i = 0; i < len; i++){
                if(this.isDataChanged(oldData[formControlNames[i]], newData[formControlNames[i]]))
                    return true;
            }
            return false;
        }

        return oldData !== newData;
    }

    /**
     * @return {boolean}
     */
    isValid() {
        const formControlNames = Object.keys(this.formGroupsContext);

        for (let i = 0; i < formControlNames.length; i++){

            const formElement = this.formGroupsContext[formControlNames[i]];

            if(!formElement.isValid()){
                this.state.isValid = false;
                return false;
            }
        }

        this.state.isValid = true;

        return true;
    }

    getState(key, defaultValue = ''){
        return this.state && this.state[key] ? this.state[key] : defaultValue;
    }

    onValidStateChange() {

        if (this.props['subscriber'] && this.props['subscriber']['onValidStateChange'] !== null && typeof this.props['subscriber']['onValidStateChange'] !== 'undefined')
            this.props['subscriber']['onValidStateChange'](this, this.state.isValid);
    }

    onFormControlUpdate() {
        if (this.isFormDataChanged()){
            this.state.isFormDataChanged = true;
        }else {
            this.state.isFormDataChanged = false;
        }

        this.state.isValid = this.isValid();
        this.onValidStateChange();

        return this;
    }

    /**
     * @return {Object}
     */
    getFormData() {

        const formControlNames = Object.keys(this.formGroupsContext);
        let data = {};
        for (let i = 0; i < formControlNames.length; i++){
            const formControlName = formControlNames[i];

            if(this.formGroupsContext[formControlName] instanceof FormArray){
                /**  @type { FormArray } */
                data[formControlName] = this.formGroupsContext[formControlName].getFormArrayData();
            } else if(this.formGroupsContext[formControlName] instanceof  FormControl){
                /**  @type { FormControl } */
                data[formControlName] = this.formGroupsContext[formControlName].getValue();
            }
        }
        return data;
    }

    getErrorMessage(){
        return this.props['errorMessage'] ? this.props['errorMessage'] : {};
    }

    setFormData(data) {

        const formControlNames = Object.keys(this.formGroupsContext);

        for (let i = 0; i < formControlNames.length; i++){
            const formControlName = formControlNames[i];

            if(this.formGroupsContext[formControlName] instanceof FormArray){
                /**  @type { FormArray } */
                const formArray = this.formGroupsContext[formControlName];
                formArray.setFormData(data[formControlName]);
            } else if(this.formGroupsContext[formControlName] instanceof  FormControl){
                /**  @type { FormControl } */
                const formControl = this.formGroupsContext[formControlName];
                formControl.setValueByType(data[formControlName]);
            }
        }
        return this;
    }

    resetFormDataByInitialData() {
        const data = this.getStoredInitialFormData();
        this.setFormData(data);
        this.isFormValid(false);
        return this;
    }

    /**
     *
     * @param name
     * @return {null|FormControl|FormArray}
     */
    getFormControl(name) {

        const formControlNames = Object.keys(this.formGroupsContext);

        for (let i = 0; i < formControlNames.length; i++){

            const formControlName = formControlNames[i];

            if(this.formGroupsContext[formControlName] instanceof FormArray){
                const formControl = this.formGroupsContext[formControlName].getFormControl(name);
                if (formControl !== null && formControl instanceof  FormControl && formControl.getFormControlName() === name)
                    return formControl;
            } else if(this.formGroupsContext[formControlName] instanceof  FormControl){
                if (formControlName === name)
                    return this.formGroupsContext[formControlName];
            }
        }

        return null;
    }

    getFormArray(formArrayName) {

    }
}

export class FormArray1 {

    /**
     * @param {FormBuilder} formBuilder
     * @param {Object} props
     * @param {Object<string , FormControl|FormArray>} formArrayContext
     */
    constructor(formBuilder, props, formArrayContext) {
        this.formBuilder = formBuilder;
        this.formControlName = props.formControlName;
        this.formArrayContext = formArrayContext;
        this.props = props;
        this.state = {
            isValid : props.isValid,
            isFormDataChanged: false
        }
    }

    /**
     *
     * @return {Object<string, FormControl|FormArray>}
     */
    getFormArrayContext() {
        return this.formArrayContext;
    }

    isFormArrayValid(showError = true) {

        const formControlNames = Object.keys(this.formArrayContext);

        for (let i = 0; i < formControlNames.length; i++){
            const formControlName = formControlNames[i];

            if(this.formArrayContext[formControlName] instanceof FormArray){
                /**  @type { FormArray } */
                const formArray = this.formArrayContext[formControlName];
                if(!formArray.isFormArrayValid(showError)){
                    this.state.isValid = false;
                    if(!showError)
                        return false;
                }
            } else if(this.formArrayContext[formControlName] instanceof  FormControl){
                /**  @type { FormControl } */
                const formControl = this.formArrayContext[formControlName];
                if(!formControl.isFormControlValid(showError)){
                    this.state.isValid = false;
                    if(!showError)
                        return false;
                    return false;
                }
            }else {
                this.state.isValid = false;
                return false;
            }
        }

        this.state.isValid = true;
        return true;
    }


    /**
     * @return {Object}
     */
    getFormArrayData() {
        const formControlNames = Object.keys(this.formArrayContext);
        let data = {};
        for (let i = 0; i < formControlNames.length; i++){
            const formControlName = formControlNames[i];

            if(this.formArrayContext[formControlName] instanceof FormArray){
                /**  @type { FormArray } */
                data[formControlName] = this.formArrayContext[formControlName].getFormArrayData();
            } else if(this.formArrayContext[formControlName] instanceof  FormControl){
                /**  @type { FormControl } */
                data[formControlName] = this.formArrayContext[formControlName].getValue();
            }
        }
        return data;
    }

    /**
     * @return {FormControl}
     * @param name
     */
    getFormControl(name) {
        const formControlNames = Object.keys(this.formArrayContext);

        for (let i = 0; i < formControlNames.length; i++){
            const formControlName = formControlNames[i];

            if(this.formArrayContext[formControlName] instanceof FormArray){
                const formControl = this.formArrayContext[formControlName].getFormControl(name);
                if (formControl !== null && formControl instanceof  FormControl)
                    return formControl;
            } else if(this.formArrayContext[formControlName] instanceof  FormControl){
                if (formControlName === name)
                    return this.formArrayContext[formControlName];
            }
        }
        return null;
    }

    isValid() {
        const formControlNames = Object.keys(this.formArrayContext);

        for (let i = 0; i < formControlNames.length; i++){

            const formElement = this.formArrayContext[formControlNames[i]];

            if(!formElement.isValid()){
                this.state.isValid = false;
                return false;
            }
        }

        this.state.isValid = true;
        return true;
    }

    /**
     * @param {string} formControlName
     * @return {FormArray}
     */
    getFormArray(formControlName) {
        return this.formArrayContext[formControlName];
    }

    setFormData(data) {
        const formControlNames = Object.keys(this.formArrayContext);

        for (let i = 0; i < formControlNames.length; i++){
            const formControlName = formControlNames[i];

            if(this.formArrayContext[formControlName] instanceof FormArray){
                /**  @type { FormArray } */
                const formArray = this.formArrayContext[formControlName];
                formArray.setFormData(data[formControlName]);
            } else if(this.formArrayContext[formControlName] instanceof  FormControl){
                /**  @type { FormControl } */
                const formControl = this.formArrayContext[formControlName];
                formControl.setValueByType(data[formControlName]);
            }
        }
        return this;
    }
}



export class FormEvent{
    static OnValueSetEvent = 'OnValueSetEvent';

    constructor(eventName, props) {
        this.name = name;
        this.props = props;
    }
}

export class FormControl1 extends Element {

    static supportedType = {
        checkbox: true,
        color: true,
        date: true,
        datetime: true,
        email: true,
        file: true,
        month: true,
        password: true,
        number: true,
        range: true,
        search: true,
        tel: true,
        time: true,
        text: true,
        week: true,
        url: true,
        select: true,
        textarea: true,
    };

    /**
     * @param {FormBuilder} formBuilder
     * @param {HTMLElement} element
     * @param {Object} props
     */
    constructor(formBuilder, element, props) {
        super(element);
        this.formBuilder = formBuilder;
        this.formControlName = props.formControlName;
        this.props = props;
        this.state = {
            isValid: props.isValid
        };

        this.setElementType(props['type']);
        this.setErrorElement(formBuilder.props['errorLabelSelector'], props['errorContainerSelector']);
        this.bindEvent();
    }

    getProperty(key, defaultValue = '') {
        if (typeof this.props[key] === 'undefined')
            return defaultValue;

        return this.props[key];
    }

    /**
     *
     * @param key
     * @param value
     * @return {FormControl}
     */
    setProperty(key, value) {
        this.props[key] = value;
        return this;
    }
    /**
     * @return {boolean}
     */
    isFormControlValid(showError = true) {
        return this.checkValidation(this.getValueByType(), showError);
    }

    /**
     * @param {string} errorSelector
     * @param {string} errorContainerSelector
     * @return {FormControl}
     */
    setErrorElement(errorSelector, errorContainerSelector) {

        this.props.errorContainerElement = document.getElementById(errorContainerSelector);

        if(this.props.errorContainerElement) {
            const elements = document.querySelector(`#${errorContainerSelector} .${errorSelector}`);
            if(elements){
                this.props.errorLabelElement = elements;
            }
        }
        return this;
    }

    /**
     * @return {FormControl}
     */
    bindEvent() {
        if (this.hasSupportedType())
            this.attachChangeListener();

        if(this.hasClickCallback()){
            this.onClickListener = this.onClick.bind(this);
            this.addClickListener(this.onClickListener);
        }
        return this;
    }

    checkValidation(value, showError = true) {
        if (this.hasValidators()) {
            const validationResult = this.formBuilder.validationService.validate(this.getValidators(), this.getValidatorsProps(), this.getValueByType());
            this.state.isValid = validationResult.isValid;
            if(showError){
                if(this.state.isValid){
                    this.hideErrorMessage();
                }else {

                    this.generateErrorMessage(validationResult.errors);
                }
            }
        }
        return this.state.isValid;
    }

    generateErrorMessage(errors) {
        const validatorNames = Object.keys(errors);

        if(validatorNames.length)
            this.showErrorMessage(ValidationService.getErrorMessage(this.getValue(), this.formBuilder.getErrorMessage(), validatorNames[0], this.getValidatorsProps()));
        else
            this.hideErrorMessage();
    }

    showErrorMessage(message) {
        if(this.props.errorContainerElement && this.props.errorLabelElement){
            this.props.errorLabelElement.innerHTML = message;
            if(this.props.errorContainerElement.classList.contains(this.formBuilder.props['errorContainerHideClass'])){
                this.props.errorContainerElement.classList.remove(this.formBuilder.props['errorContainerHideClass'])
            }
            switch (this.getElementType()) {
                case Element.SELECT: {
                    this.element.parentElement.classList.add(this.formBuilder.props['selectErrorClass']);
                    break;
                }
                case Element.TEXT:
                case Element.NUMBER:
                case Element.TEXTAREA:{
                    this.element.parentElement.classList.add(this.formBuilder.props['inputErrorClass']);
                }
            }
        }
    }

    hideErrorMessage() {
        if(this.props.errorContainerElement && this.props.errorLabelElement){
            this.props.errorLabelElement.innerHTML = '';
            if(!this.props.errorContainerElement.classList.contains(this.formBuilder.props['errorContainerHideClass'])){
                this.props.errorContainerElement.classList.add(this.formBuilder.props['errorContainerHideClass'])
            }
            switch (this.getElementType()) {
                case Element.SELECT: {
                    this.element.parentElement.classList.remove(this.formBuilder.props['selectErrorClass']);
                    break;
                }
                case Element.TEXT:
                case Element.NUMBER:
                case Element.TEXTAREA:
                    this.element.parentElement.classList.remove(this.formBuilder.props['inputErrorClass']);
            }
        }
    }

    detachChangeListener() {
        if(this.onChangeListener)
            this.getElement().removeEventListener('change', this.onChangeListener);
        return this;
    }

    attachChangeListener() {
        this.onChangeListener = this.onChange.bind(this);
        this.getElement().addEventListener('change', this.onChangeListener, false);
        return this;
    }

    onChange(event) {
        this.checkValidation(event, true);
        this.formBuilder.onFormControlUpdate();
        if (this.hasChangeCallback()) {
            this.getChangeCallback()(event, this);
        }
    }

    onClick(event) {
        if(this.hasClickCallback())
            this.getClickCallback(event, this);
    }

    /**
     * @return {Object}
     */
    getValidatorsProps() {
        return this.props['validatorsProps'];
    }

    getValue() {
        return this.getValueByType();
    }

    isValid() {
        return this.state.isValid;
    }

    /**
     * @return {FormBuilder}
     */
    getFormBuilder() {
        return this.formBuilder;
    }

    /**
     * @return {string}
     */
    getFormControlName() {
        return this.formControlName;
    }

    /**
     *
     * @return {Array}
     */
    getValidators() {
        return this.props['validators'];
    }

    /**
     * @return {CallableFunction}
     */
    getChangeCallback() {
        return this.props['subscribers']['change'];
    }

    /**
     * @return {CallableFunction}
     */
    getClickCallback() {
        return this.props['subscribers']['click'];
    }

    /**
     * @return {*|string}
     */
    getDefaultValue() {
        return this.props['defaultValue'] || '';
    }

    getErrorLabelElement(errorLabelElement) {
        return this.props.errorLabelElement;
    }

    /** @return {Boolean} */
    hasChangeCallback() {
        return this.props['subscribers'] && this.props['subscribers']['change'] !== null && typeof this.props['subscribers']['change'] !== 'undefined' ;
    }

    /** @return {Boolean} */
    hasClickCallback() {
        return this.props['subscribers'] && this.props['subscribers']['click'] !== null && typeof this.props['subscribers']['click'] !== 'undefined';
    }

    /** @return {Boolean} */
    hasValidators() {
        return this.props['validators'] && this.props['validators'].length > 0;
    }

    hasSupportedType() {
        return FormControl.supportedType[this.getElementType()] !== null && typeof FormControl.supportedType[this.getElementType()] !== 'undefined';
    }

    hasValueSetListener() {
        return this.props['subscribers'] &&  this.props['subscribers']['onValueSet'] !== null && typeof this.props['subscribers']['onValueSet'] !== 'undefined';
    }

    setValueByType(value) {
        super.setValueByType(value);
        if(this.hasValueSetListener()){
            this.props['subscribers'] && this.props['subscribers']['onValueSet'](new FormEvent(FormEvent.OnValueSetEvent, {}), this);
        }
        return this;
    }
}