<template>
  <v-app>
    <!--The navigation drawer is the one which is to be displayed only when in the xs-->
    <v-navigation-drawer v-model="sideNav" fixed temporary>
      <v-list>
        <v-list-tile v-for="item in menuItems" :key="item.title" router :to="item.link">
          <v-list-tile-action>
            <v-icon>{{  item.icon  }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            {{  item.title  }}
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="userIsAuthenticated" @click="onLogout">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            Logout
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <!--The below part is the navbar when in the sm and above displays-->
    <v-toolbar dark class="primary">
      <v-toolbar-side-icon @click.stop="sideNav = !sideNav" class="hidden-sm-and-up">
      </v-toolbar-side-icon>
      <v-toolbar-title><router-link to="/" tag="span" style="cursor: pointer">DevMeetup</router-link></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in menuItems" :key="item.title" router :to="item.link"><v-icon left dark>{{  item.icon  }}</v-icon>{{  item.title  }}</v-btn>
        <v-btn flat v-if="userIsAuthenticated" @click="onLogout"><v-icon left dark>exit_to_app</v-icon>Logout</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <!--The above is the navigation bar that will be same for all pages
        below navigation bar we have the main tag that will show components dynamically-->

    <main>
      <router-view></router-view>
    </main>


  </v-app>
</template>

<script>
export default {
  data () {
    return {
      sideNav: false
    }
  },
  computed:{
    menuItems () {
      //The menu Items array will keep a list of items in the navbar to load dynamically
      let menuItems = [
        {icon: 'face', title: 'Signup', link: '/signup'},
        {icon: 'lock_open', title: 'sign in', link: '/signin'}
      ]
      if (this.userIsAuthenticated) {
        menuItems = [
        {icon: 'supervisor_account', title: 'View Meetups', link: '/meetups'},
        {icon: 'room', title: 'Organize Meetups', link: '/createMeetups/new'},
        {icon: 'person', title: 'profile', link: '/profile'}
        ]
      }
      return menuItems
    },
    userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    }
  },
  methods: {
    onLogout () {
      this.$store.dispatch('logout')
    }
  },
  name: 'App'
}
</script>
