import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'polymerfire/firebase-firestore-script.js';
import 'polymerfire/firebase-auth.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import './icons.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
/**
 * `skeleton-smart-invite`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class SkeletonSmartInvite extends PolymerElement {
  static get template() {
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

    <firebase-auth user="{{user}}"></firebase-auth>

    <paper-input value="{{value}}" label="[[label]]" type="text" prevent-invalid-input="" minlength="4" error-message="[[errorMessage]]" invalid="{{invalid}}" autocomplete="on">
      <iron-icon icon="[[iconType]]" slot="prefix" id="value-icon"></iron-icon>
      <iron-icon class\$="[[iconValidationClass]]" icon="[[iconValidation]]" slot="suffix" hidden\$="[[iconHidden]]" invalid\$="[[invalid]]" id="status-icon"></iron-icon>
      <paper-button slot="suffix" hidden\$="[[buttonHidden]]" disabled\$="[[buttonHidden]]" on-tap="_invite">
        INVITE
        <iron-icon icon="smart-invite:send"></iron-icon>
      </paper-button>
    </paper-input>
`;
  }

  /**
   * @return {string}
   */
  static get is() {
    return 'skeleton-smart-invite';
  }

  /**
   * @return {object}
   */
  static get properties() {
    return {
      label: {
        type: String,
        value: 'Mobile number or email',
      },
      errorMessage: {
        type: String,
        value: 'Invalid value',
      },
      value: {
        type: String,
        value: null,
        reflectToAttribute: true,
        notify: true,
        observer: '_valueObserver',
      },
      invalid: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        notify: true,
      },
      iconHidden: {
        type: Boolean,
        value: true,
      },
      buttonHidden: {
        type: Boolean,
        value: true,
      },
      iconValidation: {
        type: String,
        value: null,
      },
      iconType: {
        type: String,
        value: 'smart-invite:info',
      },
      loading: {
        type: Boolean,
        value: false,
        observer: '_loadingObserver',
      },
      errorPhone: {
        type: String,
        value: 'Invalid phone number',
      },
      errorEmail: {
        type: String,
        value: 'Invalid email',
      },
      iconValidationClass: {
        type: String,
        value: null,
      },
      sent: {
        type: Boolean,
        value: false,
      },
      user: {
        type: Object,
        value: {},
      },
      info: {
        type: Object,
        value: null,
      },
      inputType: {
        type: String,
        value: null,
      },
    };
  }

  /**
   * Validation icon
   *
   * @param {boolean} status
   * @return {string}
   * @private
   */
  _computeValidationIcon(status) {
    return status ? 'close' : 'check';
  }

  /**
   * Loading Observer
   * @param {boolean} loading
   * @private
   */
  _loadingObserver(loading) {
    if (loading) {
      this.iconHidden = false;
      this.buttonHidden = true;
    } else {
      this.iconHidden = true;
    }
  }

  /**
   * Value Observer
   * @param {string} value
   * @return {undefined}
   * @private
   */
  _valueObserver(value) {
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
    let re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
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
      console.log(this.info);
      finalData = Object.assign(data, this.info);
      console.log(finalData);
    }

    if (this._validateEmail(this.value)) {
      data.email = this.value;
    }

    if (this._validatePhone(this.value)) {
      data.phoneNumber = this.value;
    }

    firebase
      .firestore()
      .collection('connection-invite').add(finalData)
      .then(() => {
        this.value = null;
        this.loading = false;
        this.iconValidationClass = '';
        this.iconValidation = 'smart-invite:check';
        this.iconHidden = false;
        this.sent = true;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * Validate Phone
   * @param {string} text
   * @return {boolean}
   * @private
   */
  _validatePhone(text) {
    let re = /^(?:\+)([0-9]{1,3})([0-9]{9,10})$/;
    return re.test(text);
  }

  /**
   * First validation to know if is email or phone number.
   * @param {string} text
   * @private
   */
  _preValidateValue(text) {
    this.value = text.toLowerCase();
    let rePhone = /\++[0-9]+/;
    let reEmail = /[a-z0-9._%+-]+@+[a-z0-9._%+-]+/;
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

window.customElements.define(SkeletonSmartInvite.is, SkeletonSmartInvite);
