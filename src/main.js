import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import { store } from './store'
import DateFilter from './filters/date'
import * as firebase from 'firebase'

//The below tag imports the alert component and stores it in the variable AlertCmp
//It is then made to be used as a global html tag app-alert
import AlertCmp from './components/Shared/Alert.vue'
import EditMeetupDialog from './components/Meetup/Edit/EditMeetupDetailsDialog.vue'
import EditMeetupDateDialog from './components/Meetup/Edit/EditMeetupDateDialog.vue'
import EditMeetupTimeDialog from './components/Meetup/Edit/EditMeetupTimeDialog.vue'
import RegisterDialog from './components/Registration/RegisterDialog.vue'
Vue.component('app-alert', AlertCmp)
Vue.component('app-edit-meetup-details',EditMeetupDialog)
Vue.component('app-edit-date-dialog',EditMeetupDateDialog)
Vue.component('app-edit-time-dialog',EditMeetupTimeDialog)
Vue.component('app-meetup-register-dialog',RegisterDialog)

Vue.use(Vuetify,{
  theme:{
    primary: '#D32F2F',
    accent: '#FF5252',
    secondary: '#BDBDBD',
    info: '#42A5F5',
    warning: '#FFA000',
    error: '#D50000',
    success: '#81C784'
    
  }
})

Vue.config.productionTip = false
//All the filters are to be decalared here
Vue.filter('date', DateFilter)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  created () {
    //As soon as the window is created, the connection to the firebase is made
    firebase.initializeApp({
      apiKey: 'AIzaSyCsMVdoY5LKOwlUi901m20826AHqOVOa8Y',
      authDomain: 'vue-meetup-dev.firebaseapp.com',
      databaseURL: 'https://vue-meetup-dev.firebaseio.com',
      projectId: 'vue-meetup-dev',
      storageBucket: 'gs://vue-meetup-dev.appspot.com',
    })

    //If there is a change in the authentication state, the firebase will check for the presence of any valid token
    //If we get a token and if the assigned user is not null, then the autoSignIn method in the store will run
    firebase.auth().onAuthStateChanged((user) =>{
      if(user) {
        this.$store.dispatch('autoSignIn', user)
        this.$store.dispatch('fetchUserData')
      }
    })
    //Once the firebase is setup, we call the loadMeetups to load all the meetups from the firebase
    this.$store.dispatch('loadMeetups')
  }
})
