<template>
  <div>
    <v-card class="text-center pa-1">
      <v-card-title class="justify-center display-1 mb-2">{{ $t('register.title') }}</v-card-title>
      <v-card-subtitle>Let's manage your property</v-card-subtitle>

      <!-- sign up form -->
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" lazy-validation>
          <v-text-field
            v-model="user.name"
            :rules="[rules.required]"
            :validate-on-blur="false"
            :error="errorName"
            :error-messages="errorNameMessage"
            :label="$t('register.name')"
            name="name"
            outlined
            @keyup.enter="submit"
            @change="resetErrors"
          ></v-text-field>

          <v-text-field
            v-model="user.email"
            :rules="[rules.required]"
            :validate-on-blur="false"
            :error="errorEmail"
            :error-messages="errorEmailMessage"
            :label="$t('register.email')"
            name="email"
            outlined
            @keyup.enter="submit"
            @change="resetErrors"
          ></v-text-field>

          <v-text-field
            v-model="user.password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required]"
            :type="showPassword ? 'text' : 'password'"
            :error="errorPassword"
            :error-messages="errorPasswordMessage"
            :label="$t('register.password')"
            name="password"
            outlined
            @change="resetErrors"
            @keyup.enter="submit"
            @click:append="showPassword = !showPassword"></v-text-field>
          <v-text-field
            v-model="user.passwordVerify"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required]"
            :type="showPassword ? 'text' : 'password'"
            :error="errorPassword"
            :error-messages="errorPasswordMessage"
            :label="$t('register.passwordRetype')"
            name="password"
            outlined
            @change="resetErrors"
            @keyup.enter="submit"
            @click:append="showPassword = !showPassword"></v-text-field>

          <v-btn
            :loading="isLoading"
            :disabled="isSignUpDisabled"
            block
            x-large
            color="primary"
            @click="submit"
          >{{ $t('register.button') }}</v-btn>
          <div v-if="showSignUpMessage" :class="{'error-text': isError, 'success-text': !isError}" style="margin: 10px 0 10px 0;">{{signUpMessage}}</div>
          <div class="caption font-weight-bold text-uppercase my-3">{{ $t('register.orsign') }}</div>

          <!-- external providers list -->
          <v-btn
            v-for="provider in providers"
            :key="provider.id"
            :loading="provider.isLoading"
            :disabled="isSignUpDisabled"
            class="mb-2 primary lighten-2 primary--text text--darken-3"
            block
            x-large
            @click="signInProvider(provider)"
          >
            <v-icon small left>mdi-{{ provider.id }}</v-icon>
            {{ provider.label }}
          </v-btn>

          <div v-if="errorProvider" class="error--text">{{ errorProviderMessages }}</div>

          <div class="mt-5 overline">
            {{ $t('register.agree') }}
            <br />
            <router-link to="">{{ $t('common.tos') }}</router-link>
            &
            <router-link to="">{{ $t('common.policy') }}</router-link>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <div class="text-center mt-6">
      {{ $t('register.account') }}
      <router-link to="/sign-in" class="font-weight-bold">
        {{ $t('register.signin') }}
      </router-link>
    </div>
  </div>
</template>
<style>
.error-text{
  color: darkred;
}
.success-text{
  color: darkgreen;
}
</style>
<script>
export default {
  data() {
    return {
      isError: false,
      showSignUpMessage: false,
      signUpMessage: '',
      // sign up buttons
      isLoading: false,
      isSignUpDisabled: false,

      // form
      isFormValid: true,
      user:{
        email: '',
        password: '',
        passwordVerify: '',
        name: ''
      },
      // form error
      errorName: false,
      errorEmail: false,
      errorPassword: false,
      errorNameMessage: '',
      errorEmailMessage: '',
      errorPasswordMessage: '',

      errorProvider: false,
      errorProviderMessages: '',

      // show password field
      showPassword: false,

      // external providers
      providers: [{
        id: 'google',
        label: 'Google',
        isLoading: false
      }, {
        id: 'facebook',
        label: 'Facebook',
        isLoading: false
      }],

      // input rules
      rules: {
        required: (value) => (value && Boolean(value)) || 'Required'
      }
    }
  },
  methods: {
    submit() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this

      self.showSignUpMessage = false

      if (this.$refs.form.validate()) {
        this.isLoading = true
        this.isSignUpDisabled = true
        this.$http.post('/sign-up/v1', this.user)
          .then((resp) => {
            self.isLoading = false
            self.isSignUpDisabled = false
            const { data } = resp

            if (data.Success) {
              self.signUpMessage = 'Your account has been created, please check your email.'
            } else {
              self.signUpMessage = data.Message
              self.isError = true
            }
            self.showSignUpMessage = true
          })
        .catch(err => {
          self.isLoading = false
          self.isSignUpDisabled = false
          self.signUpMessage = "Sorry, something went wrong."
          self.isError = true
          self.showSignUpMessage = true
        })
      }
    },
    signUp(email, password) {},
    signInProvider(provider) {},
    resetErrors() {
      this.errorName = false
      this.errorEmail = false
      this.errorPassword = false
      this.errorNameMessage = ''
      this.errorEmailMessage = ''
      this.errorPasswordMessage = ''

      this.errorProvider = false
      this.errorProviderMessages = ''
    }
  }
}
</script>
