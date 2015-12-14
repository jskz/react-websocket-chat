import React from 'react'
import './chat.sass'

class Chat extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            messages: []
        }
    }

    clear() {
        this.state.messages = []
        this.forceUpdate()
    }

    onNewMessage(messagePacket) {
        this.state.messages.push(messagePacket)
    }

    render() {
        let chat = this.state.messages.map(c =>
            (
                <li key={c.id} >
                    <div className="from">
                        {c.from || 'unnamed'} at {new Date(c.timestamp).toUTCString()}
                    </div>

                    <div className="message">{c.message}</div>
                </li>
            ))

        return (
            <div id="chat">
                <ul ref="list">
                    {chat}
                </ul>
            </div>
        )
    }
}

export default Chat
