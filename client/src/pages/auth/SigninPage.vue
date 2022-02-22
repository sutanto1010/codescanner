<template>
  <div>
    <v-card class="text-center pa-1">
      <v-card-title class="justify-center display-1 mb-2">Welcome</v-card-title>
      <v-card-subtitle>Sign in to your account</v-card-subtitle>

      <!-- sign in form -->
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" lazy-validation>
          <v-text-field
            v-model="email"
            :rules="[rules.required]"
            :validate-on-blur="false"
            :error="error"
            :label="$t('login.email')"
            name="email"
            outlined
            id="email"
            @keyup.enter="submit"
            @change="resetErrors"
          ></v-text-field>

          <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required]"
            :type="showPassword ? 'text' : 'password'"
            :error="error"
            :error-messages="errorMessages"
            :label="$t('login.password')"
            name="password"
            id="password"
            outlined
            @change="resetErrors"
            @keyup.enter="submit"
            @click:append="showPassword = !showPassword"
          ></v-text-field>

          <v-btn
            :loading="isLoading"
            :disabled="isSignInDisabled"
            block
            x-large
            id="signInBtn"
            color="primary"
            @click="submit"
          >{{ $t('login.button') }}</v-btn>

          <div id="error-message" v-if="showSignInMessage" :class="{'error-text': isError, 'success-text': !isError}" style="margin: 10px 0 10px 0;">{{ signInMessage }}</div>

          <div class="caption font-weight-bold text-uppercase my-3">{{ $t('login.orsign') }}</div>

          <!-- external providers list -->
          <div class="google-btn" id="google">
            <div class="google-icon-wrapper">
              <img class="google-icon" src="../../assets/Google__G__Logo.svg"/>
            </div>
            <p class="btn-text"><b>Sign in with Google</b></p>
          </div>

          <div v-if="errorProvider" class="error--text">{{ errorProviderMessages }}</div>

          <div class="mt-5">
            <router-link to="/auth/forgot-password">
              {{ $t('login.forgot') }}
            </router-link>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
<style>
.error-text{
  color: darkred;
}
.success-text{
  color: darkgreen;
}
.google-btn {
  margin: 0 auto !important;
  max-width: 200px;
  height: 42px;
  background-color: #4285f4;
  border-radius: 2px;
  box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.google-btn .google-icon-wrapper {
  position: absolute;
  margin-top: 1px;
  margin-left: 1px;
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background-color: #fff;
}
.google-btn .google-icon {
  margin: 8px;
}
.google-btn .btn-text {
  padding-left: 50px;
  float: left;
  margin: 11px 11px 0 0;
  color: #fff;
  font-size: 14px;
  letter-spacing: 0.2px;
}
.google-btn:hover {
  box-shadow: 0 0 6px #4285f4;
}
.google-btn:active {
  background: #1669f2;
}
</style>
<script>
import Auth from '@/services/Auth'
import router from '@/router'
let auth2=null
export default {
  data() {
    return {
      isError: false,
      signInMessage: '',
      showSignInMessage: false,
      isLoading: false,
      isSignInDisabled: false,
      // form
      isFormValid: true,
      email: '',
      password: '',

      // form error
      error: false,
      errorMessages: '',

      errorProvider: false,
      errorProviderMessages: '',

      // show password field
      showPassword: false,

      providers: [{
        id: 'google',
        label: 'Google',
        isLoading: false
      }],

      // input rules
      rules: {
        required: (value) => (value && Boolean(value)) || 'Required'
      }
    }
  },
  mounted() {
    let self=this
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '898053700366-cfnmq61qoj9q36129p1ihm608sg60voi.apps.googleusercontent.com',
      });
      self.attachSignin(document.getElementById('google'));
    });
  },
  methods: {
    attachSignin(element) {
      let self=this
      console.log(element.id);
      auth2.attachClickHandler(element, {},
        function(googleUser) {
        let profile=googleUser.getBasicProfile()
          let email = profile.getEmail()
          let temp = googleUser.getAuthResponse(true);
          const param = {
            email: email,
            password: null,
            provider: "google",
            provider_token: temp.access_token,
            image_url:profile.getImageUrl()
          }
          self.signIn(param)
        }, function(error) {
        });
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.isLoading = true
        this.isSignInDisabled = true
        const param = {
          email: this.email,
          password: this.password,
        }
        this.signIn(param)
      }
    },
    signIn(param) {
      this.showSignInMessage = false
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      self.$http.post('/sign-in/v2', param)
        .then((res) => {
          const { data } = res
          self.signInMessage = data.Message
          self.showSignInMessage = !data.Success
          self.isError = !data.Success
          self.isLoading = false
          self.isSignInDisabled = false
          if (data.Success) {
            let token=data.Data.Token
            let hotelId=data.Data.HotelID
            Auth.SetToken(token)
              .then( () => {
                if(!self.$route.query.hotelId)
                  router.push('/?hotelId='+hotelId)
                else
                  router.push('/')
              })
          }
        })
        .catch((e) => {
          console.log(e);
          self.isLoading = false
          self.isSignInDisabled = false
          self.signInMessage = 'Sign In Failed.'
          self.isError = true
          self.showSignInMessage = true
        })
    },
    signInProvider(provider) {},
    resetErrors() {
      this.error = false
      this.errorMessages = ''

      this.errorProvider = false
      this.errorProviderMessages = ''
    }
  }
}
</script>
