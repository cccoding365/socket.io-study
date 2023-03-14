<template>
  <div>
    <ul>
      <template v-for="userInfo of state.userList" :key="userInfo.id">
        <li v-if="userInfo.username === state.username">
          {{ userInfo.username }}
        </li>
        <li v-else>
          <a href="javascript:;" @click="selectUser(userInfo)">
            {{ userInfo.username }}
          </a>
        </li>
      </template>
    </ul>
    <div v-if="state.targetUser">
      <h3>{{ state.targetUser.username }}</h3>
      <input type="text" v-model="state.msg">
      <button @click="sendMsg">发送</button>
    </div>
    <div>
      <ul>
        <li v-for="(data, index) of msgList" :key="index">
          <p> {{ data.fromUsername }} : {{ new Date(data.dataTime) }} </p>
          <p> {{ data.msg }} </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { io } from "socket.io-client"
import { useRouter } from 'vue-router'
import { reactive, computed } from 'vue'

const router = useRouter()

const state = reactive({
  username: router.currentRoute.value.query.username,
  userList: [],
  targetUser: null,
  msg: '',
  msgBox: {}
})

const msgList = computed(() => {
  return (state.msgBox[state.username] && state.targetUser) ?
    state.msgBox[state.username].filter(item => {
      return item.fromUsername === state.targetUser.username || item.toUsername === state.targetUser.username
    }) : []
})

const socket = io('http://localhost:3000', {
  query: {
    username: state.username
  }
})

socket.on('online', data => {
  state.userList = data.userList
})

socket.on('receive', data => {
  appendMsg(data)
})

socket.on('error', error => {
  console.log(error)
})

const appendMsg = data => {
  !state.msgBox[state.username] && (state.msgBox[state.username] = [])
  state.msgBox[state.username].push(data)
}

const selectUser = (userInfo) => {
  state.targetUser = userInfo
}

const sendMsg = () => {
  if (!state.msg.trim().length) return
  appendMsg({
    fromUsername: state.username,
    toUsername: state.targetUser.username,
    msg: state.msg,
    dataTime: new Date().getTime()
  })

  socket.emit('send', {
    fromUsername: state.username,
    targetId: state.targetUser.id,
    msg: state.msg
  })
}
</script>
