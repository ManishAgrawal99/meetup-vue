import Vue from 'vue'
import Vuex from 'vuex'
import { stat } from 'fs';

import * as firebase from 'firebase'

Vue.use(Vuex)

export const store = new Vuex.Store({
    state:{
        loadedMeetups: [
            { imageUrl:'https://ihg.scene7.com/is/image/ihg/holiday-inn-mumbai-4769768439-4x3', id:'mumbai1', title: 'Meetup in Mumbai', date: new Date(), location:'Mumbai', description:'It\'s Mumbai' },
            { imageUrl:'https://www.thenational.ae/image/policy:1.623551:1505554788/Islamic-finance.jpg?f=16x9&w=1200&$p$f$w=edaa0a5', id:'delhi1', title: 'Meetup in Delhi', date: new Date(), location:'Delhi', description:'New Delhi Meetup'},
            { imageUrl:'https://i.ytimg.com/vi/TovsskriSxo/maxresdefault.jpg', id:'dubai1', title: 'Meetup in Dubai', date: new Date(), location:'Dubai', description:'Burj Khalifa' }
        ],
        user: null,
        loading: false,
        error: null
    },
    mutations:{
        registerUserForMeetup (state, payload) {
            const id = payload.id
            if(state.user.registeredMeetups.findIndex(meetup => meetup.id === id) >= 0) {
                return
            }
            state.user.registeredMeetups.push(id)
            state.user.fbKeys[id] = payload.fbKey
        },
        unregisterUserFromMeetup (state, payload) {
            const registeredMeetups = state.user.registeredMeetups
            registeredMeetups.splice(registeredMeetups.findIndex(meetup => meetup.id === payload),1)
            Reflect.deleteProperty(state.user.fbKeys, payload)
        },
        setLoadedMeetups (state, payload) {
            state.loadedMeetups = payload
        },
        createMeetup (state, payload){
            state.loadedMeetups.push(payload)
        },
        updateMeetup (state, payload) {
            const meetup = state.loadedMeetups.find(meetup =>{
                return meetup.id === payload.id
            })
            if (payload.title) {
                meetup.title = payload.title
            }
            if (payload.description) {
                meetup.description = payload.description
            }
            if (payload.date) {
                meetup.date = payload.date
            }
        },
        setUser (state, payload) {
            state.user = payload
        },
        setLoading (state, payload) {
            state.loading = payload
        },
        setError (state, payload) {
            state.error = payload
        },
        clearError (state){
            state.error = null
        }
    },
    actions:{
        registerUserForMeetup ({commit, getters}, payload) {
            commit('setLoading', true)
            const user = getters.user
            firebase.database().ref('/users/' + user.id).child('/registrations/')
                .push(payload)
                .then(data => {
                    commit('setLoading', false)
                    commit('registerUserForMeetup', {id: payload, fbKey: data.key})
                })
                .catch(err =>{
                    console.log(err)
                    commit('setLoading',false)
                })
        }, 
        unregisterUserFromMeetup ({commit, getters}, payload) {
            commit('setLoading', true)
            const user = getters.user
            if(!user.fbKeys){
                return
            }
            const fbKey = user.fbKeys[payload]
            firebase.database().ref('/users/' + user.id + '/registrations/').child(fbKey).remove()
                .then(() => {
                    commit('setLoading', false)
                    commit('unregisterUserFromMeetup', payload)
                })
                .catch(err => {
                    console.log(err)
                    commit('setLoading', false)
                })
        },
        loadMeetups ({commit}) {
            commit('setLoading', true)
            //.on('value') means that the method will be fired when there is any change in the value 
            firebase.database().ref('meetups').once('value')
            .then((data) =>{
                const meetups = []
                const obj = data.val()
                for (let key in obj){
                    meetups.push({
                        id: key,
                        title: obj[key].title,
                        description: obj[key].description,
                        imageUrl: obj[key].imageUrl,
                        date: obj[key].date,
                        creatorId: obj[key].creatorId,
                        location: obj[key].location
                    })
                }
                commit('setLoadedMeetups',meetups)
                commit('setLoading', false)
            })
            .catch((err) => {
                console.log(err)
                commit('setLoading', true)
            })
        },
        createMeetup ({commit, getters}, payload) {
            //We take the payload received and then format it in the desired format 
            // commit('setLoading', true)
            // commit('clearError')

            
                const meetup = {
                    title: payload.title,
                    location: payload.location,
                    description: payload.description,
                    date: payload.date.toISOString(),
                    creatorId: getters.user.id,
                    image: payload.image
                }
                //We push the data to the firebase data file which then returns an object with id(key)
                //We take this key and add it as an id to the meetup object that we had pushed
                //Now thw meetup obj with the id is stored into the loaded meetups state which is used to load all the meetups 
                let imageUrl
                let key
                
                firebase.database().ref('meetups').push(meetup)
                    .then((data) =>{
                        key = data.key
                        return key
                    })
                    .then(key =>{
                        const filename = payload.image.name
                        console.log(filename)
                        const ext = filename.slice(filename.lastIndexOf('.'))
                        var uploadTask = firebase.storage().ref('meetups/'+ key + '.' + ext).put(payload.image)

                        uploadTask.on('state_changed', function(snapshot){
                            // Observe state change events such as progress, pause, and resume
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Upload is ' + progress + '% done');
                            switch (snapshot.state) {
                              case firebase.storage.TaskState.PAUSED: // or 'paused'
                                console.log('Upload is paused');
                                break;
                              case firebase.storage.TaskState.RUNNING: // or 'running'
                                console.log('Upload is running');
                                break;
                            }
                          }, function(error) {
                            // Handle unsuccessful uploads
                          }, function() {
                            // Handle successful uploads on complete
                            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                                console.log('File available at', downloadURL);
                                imageUrl = downloadURL
                                return firebase.database().ref('meetups').child(key).update({imageUrl: imageUrl})
                            })
                            .then(() =>{
                                commit('createMeetup', {
                                    ...meetup,
                                    imageUrl: imageUrl,
                                    id: key
                                })
                            })
                            .catch((err) =>{
                                console.log(err)
                            })
                          })

                    })
                    .catch((err) =>{
                        console.log(err)
                    })            
        },
        updateMeetupData ({commit}, payload) {
            commit('setLoading', true)
            commit('clearError')
            const updateObj = {}
            if (payload.title) {
                updateObj.title = payload.title
            }
            if(payload.description) {
                updateObj.description = payload.description
            }
            if(payload.date) {
                updateObj.date = payload.date
            }
            firebase.database().ref('meetups').child(payload.id).update(updateObj)
                .then(() =>{
                    commit('setLoading', false)
                    commit('updateMeetup', payload)
                })
                .catch(err =>{
                    console.log(err)
                    commit('setLoading',false)
                })

        },
        signUserUp ({commit}, payload) {
            commit('setLoading', true)
            commit('clearError')
            firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
            .then(
                user =>{
                    commit('setLoading', false)
                    const newUser = {
                        id: user.uid,
                        registeredMeetups: [],
                        fbKeys: {}
                    }
                    commit('setUser', newUser)
                }
            )
            .catch(
                error =>{
                    console.log(error)
                    commit('setLoading', false)
                    commit('setError', error)
                }
            )
        },
        signUserIn ({commit}, payload) {
            commit('setLoading', true)
            commit('clearError')
            firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
            .then(
                user =>{
                    commit('setLoading', false)
                    const newUser = {
                        id: user.uid,
                        registeredMeetups: [],
                        fbKeys: {}
                    }
                    commit('setUser', newUser)
                }
            )
            .catch(
                error =>{
                    console.log(error)
                    commit('setLoading', false)
                    commit('setError', error)
                }
            )
        },
        autoSignIn ({commit}, payload) {
            commit('setUser', {
                id:payload.uid, 
                registeredMeetups: [],
                fbKeys: {}
            })
        },
        fetchUserData ({commit, getters}) {
            commit('setLoading', true)
            firebase.database().ref('/users/' + getters.user.id + '/registrations').once('value')
                .then(data => {
                    //.val converts the Firebase returned object into a JS object that we can work with
                    const dataPairs = data.val()
                    let registeredMeetups = []
                    let swappedPairs = {}
                    //console.log(values)
                    for (let key in dataPairs) {
                        registeredMeetups.push(dataPairs[key])
                        swappedPairs[dataPairs[key]] = key
                    }
                    // console.log(registeredMeetups)
                    // console.log(swappedPairs)
                    const updatedUser = {
                        id: getters.user.id,
                        registeredMeetups: registeredMeetups,
                        fbKeys: swappedPairs, 
                    }
                    commit('setLoading', false)
                    commit('setUser', updatedUser)
                })
                .catch(err =>{
                    console.log(err)
                    commit('setLoading', false)
                })
        },
        logout ({commit}){
            firebase.auth().signOut()
            commit('setUser', null)
        },
        clearError ({commit}) {
            commit('clearError')
        }
    },
    getters:{
        loadedMeetups(state){
            return state.loadedMeetups.sort((meetupA, meetupB) =>{
                return meetupA.date > meetupB.date
            })
        },
        featuredMeetups(state, getters){
            return getters.loadedMeetups.slice(0,5)
        },
        loadedMeetup(state){
            return (meetupId) =>{
                return state.loadedMeetups.find((meetup) =>{
                    return meetup.id === meetupId
                })
            }
        },
        user (state) {
            return state.user
        },
        error (state) {
            return state.error
        },
        loading (state) {
            return state.loading
        }
    }
})