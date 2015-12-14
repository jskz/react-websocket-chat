import React from 'react'
import './chat.sass'

class Chat extends React.Component {
    constructor(props) {
        super(props)
    }

    onNewMessage(messagePacket) {
    }

    render() {
        let chat = this.props.messages.map(c =>
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
                <ul>
                    {chat}
                </ul>
            </div>
        )
    }
}

export default Chat
