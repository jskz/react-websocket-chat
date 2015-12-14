import React from 'react'
import p from '../protocol'

class Input extends React.Component {
    constructor(props) {
        super(props)
    }

    onSubmit(e) {
        e.preventDefault()
        this.props.socket.send(JSON.stringify({
            type: p.MESSAGE_CHAT,
            data: {
                message: this.refs.input.value
            }
        }))

        this.refs.input.value = ''
        this.forceUpdate()
    }

    render() {
        return (
            <form className="input" onSubmit={(e) => this.onSubmit(e)}>
                <label htmlFor="chat-input">chat</label>
                <input autoComplete={'off'} ref="input" type="text" name="message" id="message"></input>
                <button type="submit">Send</button>
            </form>
        )
    }
}

export default Input
