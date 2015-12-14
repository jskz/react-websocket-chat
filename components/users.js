import React from 'react'
import './users.sass'

class Users extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        let users = this.props.users.map(u =>
            (
                <li className={u.nickname === null ? 'guest' : 'user'} key={u.id}>{u.nickname || 'unnamed'}</li>
            ))

        return (
            <div id="users">
                {users || 'None'}
            </div>
        )
    }
}

export default Users
