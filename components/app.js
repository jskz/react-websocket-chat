import React from 'react'
import Modal from 'boron/FadeModal'

import p from '../protocol'
import Chat from './chat'
import Input from './input'
import Users from './users'

import './app.sass'

class App extends React.Component {
    onSocketOpen() {
        console.log('Connection established!')
    }

    sendPacket(type, data) {
        let msg = JSON.stringify({
            type: type,
            data: data
        })
        this.socket.send(msg)
    }

    onSocketData(message) {
        let decoded = JSON.parse(message.data)

        if(decoded.type === p.MESSAGE_WHO_ARE_YOU) {
            this.showModal()
            return
        }

        if(decoded.type === p.MESSAGE_CHAT) {
            this.state.chatLog.push(decoded.data)
            this.refs.chat.onNewMessage(decoded.data)
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_NICKNAME_GRANTED) {
            this.hideModal()
            this.state.desiredNameValid = true
            this.state.loggedIn = true
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_NAME_TOO_SHORT) {
            this.state.lastNameDetail = 'Nickname too short.'
            this.state.desiredNameValid = false
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_NAME_IN_USE) {
            this.state.lastNameDetail = 'Nickname already in use.'
            this.state.desiredNameValid = false
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_NAME_TOO_LONG) {
            this.state.lastNameDetail = 'Nickname too long.'
            this.state.desiredNameValid = false
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_NAME_BAD_CHARACTERS) {
            this.state.lastNameDetail = 'Nickname contains invalid characters.'
            this.state.desiredNameValid = false
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_NICKNAME_VALID) {
            this.state.lastNameDetail = ''
            this.state.desiredNameValid = true
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_USER_STATE_CHANGE) {
            this.state.userList
                .filter(u => u.id == decoded.data.id)
                .map(u => {
                    if('nickname' in decoded.data) {
                        u.nickname = decoded.data.nickname
                    }
                })
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_USER_LEAVES) {
            let matches = this.state.userList.filter(
                u => u.id == decoded.data.id
            )

            if(matches && matches.length == 1) {
                this.state.userList.splice(
                    this.state.userList.indexOf(matches[0]),
                    1)
                this.forceUpdate()
            }
        }

        if(decoded.type === p.MESSAGE_USER_JOINS) {
            this.state.userList.push(decoded.data)
            this.forceUpdate()
            return
        }

        if(decoded.type === p.MESSAGE_USER_LIST) {
            this.state.userList = []
            decoded.data.map(u => this.state.userList.push(u))
            this.forceUpdate()
            return
        }
    }

    onClick() {
        if(this.state.desiredNameValid && !this.state.pending) {
            this.sendPacket(p.MESSAGE_REQUEST_NICKNAME, {nickname: this.state.desiredName})
            this.state.pending = true
        }
    }

    onSubmit(e) {
        e.preventDefault()
        this.onClick()
    }

    onChange(v) {
        this.state.desiredName = v
        this.sendPacket(p.MESSAGE_CHECK_NICKNAME, {nickname: v})
    }

    onSocketClose() {
    }

    showModal() {
        this.refs.modal.show()
    }

    hideModal() {
        this.refs.modal.hide()
    }

    constructor(props) {
        super(props)

        this.state = {
            chatLog:           [],
            pending:           false,
            loggedIn:          false,
            desiredNameValid:  false,
            lastNameDetail:    '',
            desiredName:       '',
            userList:          []
        }
    }
    componentDidMount() {
        this.socket = new WebSocket('ws://localhost:8080')
        this.socket.onopen = () => this.onSocketOpen()
        this.socket.onmessage = (m) => this.onSocketData(m)
        this.socket.onclose = () => this.onSocketClose()
    }

    render() {
        return (
            <div id="app">
                <div className="overlay-fx">
                    <header>
                        Example webapp using React and WebSockets
                    </header>

                    <div className="view">
                        <Chat ref="chat" messages={this.state.chatLog} />
                        <Users users={this.state.userList} />
                    </div>

                    <div className="input">
                        <Input socket={this.socket} />
                    </div>
                </div>

                <Modal ref="modal">
                    <div className="modal-segment">
                        <h2>What is your nickname?</h2>

                        <form onSubmit={(e) => this.onSubmit(e)} action="#">
                            <label htmlFor="nickname">Name: </label>
                            <input autoComplete={'off'} onChange={v => this.onChange(v.target.value)} type="text" name="nickname" id="nickname"></input>
                        </form>

                        <div className="last-details">
                            {this.state.lastNameDetail}
                        </div>

                        {
                            (this.state.desiredNameValid) ? (
                                <div className="login-button">
                                    <button onClick={() => this.onClick()} className="login-btn">
                                        Login
                                    </button>
                                </div>) : []
                        }
                    </div>
                </Modal>
            </div>
        )
    }
}

export default App
