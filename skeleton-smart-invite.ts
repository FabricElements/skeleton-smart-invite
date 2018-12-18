import {LitElement, html, property, PropertyValues} from '@polymer/lit-element';

// Components
import '@material/mwc-button/mwc-button.js';
import '@polymer/paper-input/paper-input.js'
import '@polymer/iron-icon/iron-icon.js'
import './icons.js'

class SkeletonSmartInvite extends LitElement {

  @property({type: String})
  label ='Mobile number or email';

  @property({type: String})
  errorMessage = 'Invalid value';

  @property({type: Boolean, reflect: true})
  invalid = false;

  @property({type: Boolean, reflect: true})
  iconHidden = true;

  @property({type: Boolean, reflect: true})
  buttonHidden = true;

  @property({type: String})
  iconValidation = '';

  @property({type: String, reflect: true})
  iconType = 'smart-invite:info';

  @property({type: String, reflect: true})
  errorPhone = 'Invalid phone number';

  @property({type: String, reflect: true})
  errorEmail = 'Invalid email';

  @property({type: String, attribute: 'icon-validation-class'})
  iconValidationClass = '';

  @property({type: Boolean})
  sent = false;

  @property({type: Object})
  user = {};

  @property({type: Object})
  info = null;

  @property({type: String})
  inputType = '';

  @property({
    type: Boolean,
    hasChanged(value: Boolean, oldValue: Boolean): boolean {
      return value == !oldValue;
    }
  })
  loading = false;

  @property({
    type: String,
    hasChanged(value: string): boolean {
      return value.length >= 3;
    }
  })
  value = '';

  protected render() {
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
          /*color: var(--paper-green-500);*/
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
  
        mwc-button {
          padding: 5px;
          font-size: 16px;
          margin: 5px 0;
          @apply(--skeleton-smart-invite-button);
        }
  
        mwc-button:not([disabled]) {
          background-color: var(--paper-blue-a200);
          color: white;
        }
  
        mwc-button iron-icon {
          margin-left: 5px;
          --iron-icon-width: 16px;
          --iron-icon-height: 16px;
        }
      </style>
      <paper-input 
        @keyup="${(input: any) => {this._inputUpdate(input.target.value)}}" 
        .value="${this.value}" 
        .label="${this.label}" 
        type="text" 
        prevent-invalid-input 
        minlength="4" 
        .error-message="${this.errorMessage}" 
        ?invalid="${this.invalid}" 
        autocomplete="on">
        <iron-icon .icon="${this.iconType}" slot="prefix" id="value-icon"></iron-icon>
        <iron-icon class="${this.iconValidationClass}" .icon="${this.iconValidation}" slot="suffix" ?hidden="${this.iconHidden}" ?invalid="${this.invalid}" id="status-icon"></iron-icon>
        <mwc-button slot="suffix" ?hidden="${this.buttonHidden}" ?disabled="${this.buttonHidden}" @click="${this._invite}">
          INVITE
          <iron-icon icon="smart-invite:send"></iron-icon>
        </mwc-button>
      </paper-input>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    // @ts-ignore
    firebase.auth().onAuthStateChanged((user) => {
      // @ts-ignore
      console.log(user);
      this.user = user;
    });
  }

  _inputUpdate(value: string) {
    let isValidPhone = false;
    let isValidEmail = false;
    this.value = value;
    this.iconType = 'smart-invite:info';
    this.iconHidden = true;
    this._preValidateValue(this.value);
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
   * Listen for updates, if loading updated change related variables
   * @param {PropertyValues} _changedProperties
   * @protected
   */
  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    if (_changedProperties.has('loading')) {
      if (this.loading) {
        this.iconHidden = false;
        this.buttonHidden = true;
      } else {
        this.iconHidden = true;
      }
    }
  }

  /**
   * Validate Email
   * @param {string} text
   * @return {boolean}
   * @private
   */
  _validateEmail(text: string): boolean {
    let re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    return re.test(text);
  }

  /**
   * Validate Phone
   * @param {string} text
   * @return {boolean}
   * @private
   */
  _validatePhone(text: string) {
    let re = /^(?:\+)([0-9]{1,3})([0-9]{9,10})$/;
    return re.test(text);
  }

  /**
   * First validation to know if is email or phone number.
   * @param {string} text
   * @private
   */
  _preValidateValue(text: string) {
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

  /**
   * Invite
   * @private
   */
  async _invite() {
    this.iconValidation = 'smart-invite:sync';
    this.iconValidationClass = 'sync';
    this.loading = true;
    // @ts-ignore
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const data = {
      created: timestamp,
      updated: timestamp,
      // @ts-ignore
      uid: this.user.uid,
      // @ts-ignore
      name: this.user.displayName,
      // @ts-ignore
      avatar: this.user.photoURL,
    };

    let finalData = data;
    if (this.info) {
      // @ts-ignore
      finalData = Object.assign(data, JSON.parse(this.info));
    }
    if (this._validateEmail(this.value)) {
      // @ts-ignore
      data.email = this.value;
    }
    if (this._validatePhone(this.value)) {
      // @ts-ignore
      data.phoneNumber = this.value;
    }

    // @ts-ignore
    try {
      const collection = firebase.firestore().collection('connection-invite');
      await collection.add(finalData);
      this.value = '';
      this.loading = false;
      this.iconValidationClass = '';
      this.iconValidation = 'smart-invite:check';
      this.iconHidden = false;
      this.sent = true;
      this.iconType = 'smart-invite:info';
    } catch (error) {
      console.error(error)
    }
  }

  static get is() {
    return 'skeleton-smart-invite';
  }

}

window.customElements.define(SkeletonSmartInvite.is, SkeletonSmartInvite);
