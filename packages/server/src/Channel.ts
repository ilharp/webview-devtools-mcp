import { EventEmitter } from 'node:events'

export class Channel extends EventEmitter {
  private _connections: Channel[] = []

  send(msg: unknown) {
    for (const connection of this._connections) {
      connection.emit('message', msg, this)
    }
  }

  connect(connection: Channel) {
    if (this.isConnected(connection)) return

    this._connections.push(connection)
    connection.connect(this)
  }

  disconnect(connection: Channel) {
    if (!this.isConnected(connection)) return

    this._connections = this._connections.filter((item) => item !== connection)
    connection.disconnect(this)
  }

  isConnected(connection: Channel) {
    if (connection === this) {
      throw new Error('Channel cannot be connected to itself.')
    }

    return this._connections.includes(connection)
  }

  destroy() {
    for (const connection of [...this._connections]) {
      this.disconnect(connection)
    }
  }
}
