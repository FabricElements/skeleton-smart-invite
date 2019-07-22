/* eslint-disable max-len */
import {html, LitElement} from 'lit-element';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import './icons.js';

const firebase = window.firebase;

/**
 * skeleton-smart-invite
 */
class SkeletonSmartInvite extends LitElement {
  /**
   * properties
   */
  static get properties() {
    return {
      label: {type: String, attribute: 'label'},
      errorMessage: {type: String, attribute: 'error-message'},
      value: {type: String},
      invalid: {type: Boolean, attribute: 'invalid', reflect: true},
      iconHidden: {type: Boolean, attribute: 'icon-hidden'},
      buttonHidden: {type: Boolean, attribute: 'button-hidden'},
      iconValidation: {type: String, attribute: 'icon-validation'},
      iconType: {type: String, attribute: 'icon-type'},
      loading: {type: Boolean, attribute: 'loading'},
      errorPhone: {type: String, attribute: 'error-phone'},
      errorEmail: {type: String, attribute: 'error-email'},
      iconValidationClass: {type: String, attribute: 'icon-validation-class'},
      sent: {type: Boolean, attribute: 'sent'},
      user: {type: Object, attribute: 'user'},
      info: {type: Object, attribute: 'info'},
      inputType: {type: String, attribute: 'input-type'},
    };
  }

  /**
   * values
   */
  constructor() {
    super();
    this.label = 'Mobile number or email';
    this.errorMessage = 'Invalid value';
    this.value = null;
    this.invalid = false;
    this.iconHidden = true;
    this.buttonHidden = true;
    this.iconValidation = null;
    this.iconType = 'smart-invite:info';
    this.loading = false;
    this.errorPhone = 'Invalid phone number';
    this.errorEmail = 'Invalid email';
    this.inconValidationClass = null;
    this.sent = false;
    this.user = {};
    this.info = null;
    this.inputType = null;
  }

  /**
   * render
   * @return {TemplateResult|TemplateResult|TemplateResult}
   */
  render() {
    return html`
    <!--suppress CssInvalidPseudoSelector -->
    <!--suppress CssUnresolvedCustomProperty -->
    <!--suppress CssUnresolvedCustomPropertySet -->
    <style is="custom-style">
      :host {
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      #value-icon {
        margin: 10px 0.5rem 10px 0;
      }

      #status-icon {
        margin-left: 0.5rem;
        color: var(--paper-green-500);
      }

      #status-icon.sync {
        transform: rotate(45deg);
        color: var(--paper-grey-500);

        -webkit-animation: spin 4s linear infinite;
        -moz-animation: spin 4s linear infinite;
        animation: spin 4s linear infinite;
      }

      @-moz-keyframes spin {
        100% {
          -moz-transform: rotate(-360deg);
        }
      }

      @-webkit-keyframes spin {
        100% {
          -webkit-transform: rotate(-360deg);
        }
      }

      @keyframes spin {
        100% {
          -webkit-transform: rotate(-360deg);
          transform: rotate(-360deg);
        }
      }

      #status-icon[invalid] {
        color: var(--error-color);
      }

      paper-button {
        padding: 5px;
        font-size: 16px;
        margin: 5px 0;
        @apply(--skeleton-smart-invite-button);
      }

      paper-button:not([disabled]) {
        background-color: var(--paper-blue-a200);
        color: white;
      }

      paper-button iron-icon {
        margin-left: 5px;
        --iron-icon-width: 16px;
        --iron-icon-height: 16px;
      }
    </style>

    <firebase-auth user="${this.user}"></firebase-auth>
   <paper-input 
   .value="${this.value}"
   label="${this.label}" 
   type="text" 
   prevent-invalid-input 
   minlength="4" 
   error-message="${this.errorMessage}" 
   ?invalid="${this.invalid}"
   @value-changed="${this._valueObserver}"
   autocomplete="on">
     <iron-icon icon="${this.iconType}" slot="prefix" id="value-icon">
</iron-icon>
     <iron-icon class="${this.iconValidation}"
     icon="${this.iconValidation}" 
     slot="suffix"
     ?hidden="${this.iconHidden}"
     ?invalid="${this.invalid}" 
     id="status-icon"></iron-icon>
     <paper-button slot="suffix" 
     ?hidden="${this.buttonHidden}" 
     ?disabled="${this.buttonHidden}" 
     @tap="${this._invite}">
        INVITE
        <iron-icon icon="smart-invite:send"></iron-icon>
      </paper-button>
    </paper-input>
`;
  }

  /**
   * Connected callback
   */
  connectedCallback() {
    super.connectedCallback();
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  /**
   * Validation icon
   * @param {boolean} status
   * @return {string}
   * @private
   */
  _computeValidationIcon(status) {
    return status ? 'close' : 'check';
  }

  /**
   * Loading Observer
   * @private
   */
  _loadingObserver() {
    const loading = this.loading;
    if (loading) {
      this.iconHidden = false;
      this.buttonHidden = true;
    } else {
      this.iconHidden = true;
    }
    console.log('loading observer', loading);
  }

  /**
   * updated
   * @param {PropertyValues} changedProperties
   */
  updated(changedProperties) {
    // @ts-ignore
    changedProperties.forEach((oldValue, propName) => {
      switch (propName) {
        case 'loading':
          this._loadingObserver();
          break;
      }
    });
  }

  /**
   * Value Observer
   * @param {object} event
   * @return {undefined}
   * @private
   */
  _valueObserver(event) {
    this.value = event.detail.value;
    const value = this.value;
    let isValidPhone = false;
    let isValidEmail = false;
    this.iconType = 'smart-invite:info';
    this.iconHidden = true;
    if (!value) {
      this.buttonHidden = true;
      return;
    }
    if (value.length < 3) {
      this.iconType = 'smart-invite:info';
    } else {
      this.invalid = true;
      this.buttonHidden = true;
    }
    this._preValidateValue(value);
    if (this.inputType === 'phone') {
      isValidPhone = this._validatePhone(value);
      if (isValidPhone) {
        this.iconType = 'smart-invite:phone';
        this.invalid = false;
        this.buttonHidden = false;
      }
    }
    if (this.inputType === 'email') {
      isValidEmail = this._validateEmail(value);
      if (isValidEmail) {
        this.iconType = 'smart-invite:email';
        this.invalid = false;
        this.buttonHidden = false;
      }
    }
  }

  /**
   * Validate Email
   * @param {string} text
   * @return {boolean}
   * @private
   */
  _validateEmail(text) {
    const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    return re.test(text);
  }

  /**
   * Invite
   * @private
   */
  _invite() {
    this.iconValidation = 'smart-invite:sync';
    this.iconValidationClass = 'sync';
    this.loading = true;

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const data = {
      created: timestamp,
      updated: timestamp,
      uid: this.user.uid,
      name: this.user.displayName,
      avatar: this.user.photoURL,
    };

    let finalData = data;
    if (this.info) {
      finalData = Object.assign(data, this.info);
    }

    if (this._validateEmail(this.value)) {
      data.email = this.value;
    }

    if (this._validatePhone(this.value)) {
      data.phoneNumber = this.value;
    }
    firebase.firestore().collection('connection-invite').add(finalData).then(() => {
      this.value = null;
      this.loading = false;
      this.iconValidationClass = '';
      this.iconValidation = 'smart-invite:check';
      this.iconHidden = false;
      this.sent = true;
    }).catch((err) => {
      console.warn(err.message);
    });
    console.log('invite');
  }

  /**
   * Validate Phone
   * @param {string} text
   * @return {boolean}
   * @private
   */
  _validatePhone(text) {
    const re = /^(?:\+)([0-9]{1,3})([0-9]{9,10})$/;
    return re.test(text);
  }

  /**
   * First validation to know if is email or phone number.
   * @param {string} text
   * @private
   */
  _preValidateValue(text) {
    this.value = text.toLowerCase();
    const rePhone = /\++[0-9]+/;
    const reEmail = /[a-z0-9._%+-]+@+[a-z0-9._%+-]+/;
    if (rePhone.test(text)) {
      this.value = text.replace(/[-_() ]/g, '');
      this.inputType = 'phone';
      this.iconType = 'smart-invite:phone';
      this.errorMessage = 'Invalid mobile number';
      return;
    }
    if (reEmail.test(text)) {
      this.inputType = 'email';
      this.iconType = 'smart-invite:email';
      this.errorMessage = 'Invalid email';
    }
  }
}

customElements.define('skeleton-smart-invite', SkeletonSmartInvite);
