import axios from 'axios'
import md5 from 'md5'

let usersList = []
let rolesList = []
let groupsList = []

export const getUsers = () => usersList
export const getRoles = () => rolesList
export const getGroups = () => groupsList
export const getRoleById = (roleId) => rolesList.find(role => role.id === roleId)
export const addRoleToList = (role) => {
  rolesList.push(role)
}

export const addGroupToList = (group) => {
  groupsList.push(group)
}

export const addUserToList = (user) => {
  usersList.push(user)
}

export const removeRoleFromList = (role) => {
  rolesList = rolesList.filter(r => r.id !== role.id)
}

export const removeGroupFromList = (group) => {
  groupsList = groupsList.filter(g => g.id !== group.id)
}

export const removeUserFromList = (user) => {
  usersList = usersList.filter(u => u.id !== user.id)
}

// User class
export class User {
  constructor (id, login, pass, fullName, groupId, roleId, active, createdAt, logon) {
    this.id = id
    this.login = login
    this.password = pass
    this.fullName = fullName
    this.groupId = groupId
    this.roleId = roleId
    this.active = active
    this.createdAt = createdAt
    this.group = null
    this.role = null
    this.logon = logon
  }

  assignGroup (group) {
    this.group = group
    this.groupId = group ? group.id : null
  }

  assignRole (role) {
    this.role = role
    this.roleId = role ? role.id : null
  }

  getGroup () {
    return this.group
  }

  getPersonalRole () {
    return this.role
  }

  getAllRoles () {
    return this.role ? [...this.group.getAllRoles(), this.role] : this.group.getAllRoles()
  }

  save () {
    return new Promise((resolve, reject) => {
      const user = {
        login: this.login,
        password: this.password,
        fullName: this.fullName,
        groupId: this.group ? this.group.id : null,
        roleId: this.role ? this.role.id : null,
        active: this.active
      }
      if (this.id) {
        axios.put(`/api/users/${this.id}`, user)
          .then(response => resolve(this))
          .catch(err => reject(err))
      } else {
        axios.post('/api/users', user)
          .then(response => {
            this.id = response.data.id
            this.createdAt = response.data.createdAt
            resolve(this)
          })
          .catch(err => reject(err))
      }
    })
  }

  remove () {
    return axios.delete(`/api/users/${this.id}`)
  }
}

// Group
export class Group {
  constructor (id, name, description) {
    this.id = id
    this.name = name
    this.description = description
    this.roles = new Map()
  }

  assignToRole (role) {
    return new Promise((resolve, reject) => {
      axios.post('/api/groupsRoles', {
        groupId: this.id,
        roleId: role.id
      })
        .then(() => {
          this.roles.set(role.id, role)
          resolve()
        })
        .catch(err => reject(err))
    })
  }

  removeRole (roleId) {
    this.roles.delete(roleId)
  }

  removeAllRoles () {
    return new Promise((resolve, reject) => {
      axios.delete(`/api/groupsRoles/${this.id}`)
        .then(() => {
          this.roles.clear()
          resolve()
        })
        .catch(err => reject(err))
    })
  }

  getAllRoles () {
    return [...this.roles.values()]
  }

  getName () {
    return this.name
  }

  getDescription () {
    return this.description
  }

  setName (name) {
    this.name = name
  }

  setDescription (description) {
    this.description = description
  }

  save () {
    return new Promise((resolve, reject) => {
      const group = {
        name: this.name,
        description: this.description
      }
      if (this.id) {
        axios.put(`/api/groups/${this.id}`, group)
          .then(() => resolve(this))
          .catch(err => reject(err))
      } else {
        axios.post('/api/groups', group)
          .then((response) => {
            this.id = response.data.id
            resolve(this)
          })
          .catch(err => reject(err))
      }
    })
  }

  remove () {
    return axios.delete(`/api/groups/${this.id}`)
  }
}

// Role
export class Role {
  constructor (id, name, description) {
    this.id = id
    this.name = name
    this.description = description
    this.permissions = new Map()
  }

  assignToPermission (permission) {
    this.permissions.set(permission.id, permission)
    return new Promise((resolve, reject) => {
      axios.post('/api/rolesPermissions', {
        roleId: this.id,
        permissionId: permission.id
      })
        .then(() => resolve())
        .catch(err => reject(err))
    })
  }

  removePermission (permissionId) {
    this.permissions.delete(permissionId)
  }

  getName () {
    return this.name
  }

  setName (name) {
    this.name = name
  }

  setDescription (description) {
    this.description = description
  }

  getDescription () {
    return this.description
  }

  getPermissions () {
    return [...this.permissions.values()]
  }

  save () {
    return new Promise((resolve, reject) => {
      const role = {
        name: this.name,
        description: this.description
      }
      if (this.id) {
        axios.put(`/api/roles/${this.id}`, role)
          .then(() => resolve(this))
          .catch(err => reject(err))
      } else {
        axios.post('/api/roles', role)
          .then(response => {
            this.id = response.data.id
            resolve(this)
          })
          .catch(err => reject(err))
      }
    })
  }

  remove () {
    return axios.delete(`/api/roles/${this.id}`)
  }
}

// Permission
export class Permission {
  constructor (id, name, type, objectId, createdAt) {
    this.id = id
    this.name = name
    this.type = type
    this.objectId = objectId
    this.createdAt = createdAt
  }

  getName () {
    return this.name
  }

  getType () {
    return this.type
  }

  setType (type) {
    this.type = type
  }

  getResource () {
    return this.objectId
  }

  save () {
    return new Promise((resolve, reject) => {
      if (this.id) {
        axios.put(`/api/permissions/${this.id}`, {
          name: this.name,
          description: this.description
        })
          .then(() => resolve(this))
          .catch(err => reject(err))
      } else {
        axios.post('/api/permissions', {
          name: this.name,
          type: this.type,
          objectId: this.objectId
        })
          .then(response => {
            this.id = response.data.id
            resolve(this)
          })
          .catch(err => reject(err))
      }
    })
  }

  remove () {
    return axios.delete(`/api/permissions/${this.id}`)
  }
}

export async function loadRBAC () {
  console.log('loadRBAC')
  usersList = []
  groupsList = []
  rolesList = []
  const groups = axios.get('/api/groups')
    .then((response) => {
      let groups = new Map()
      for (let data of response.data) {
        let group = new Group(data.id, data.name, data.description)
        groups.set(data.id, group)
      }
      return groups
    })
    .catch(error => {
      console.log(error)
      throw new Error(error)
    })

  const roles = axios.get('/api/roles')
    .then((response) => {
      let roles = new Map()
      for (let data of response.data) {
        let role = new Role(data.id, data.name, data.description)
        roles.set(data.id, role)
      }
      return roles
    })
    .catch(error => {
      console.log(error)
      throw new Error(error)
    })

  const users = axios.get('/api/users')
    .then((response) => {
      let users = new Map()
      for (let data of response.data) {
        let user = new User(data.id, data.name, data.password, data.fullName, data.groupId, data.roleId, data.active, data.createdAt, data.logon)
        users.set(data.id, user)
      }
      return users
    })
    .catch(error => {
      console.log(error)
      throw new Error(error)
    })

  const permissions = axios.get('/api/permissions')
    .then((response) => {
      let permissions = new Map()
      for (let data of response.data) {
        let permission = new Permission(data.id, data.name, data.type, data.objectId, data.createdAt)
        permissions.set(data.id, permission)
      }

      return permissions
    })
    .catch(error => {
      console.log(error)
      throw new Error(error)
    })

  const groupsRoles = axios.get('/api/groupsRoles')
    .then((response) => {
      let groupRoles = []
      for (let data of response.data) {
        let groupRole = {
          groupId: data.groupId,
          roleId: data.roleId
        }
        groupRoles.push(groupRole)
      }
      return groupRoles
    })
    .catch(error => {
      console.log(error)
      throw new Error(error)
    })

  const rolesPermissions = axios.get('/api/rolesPermissions')
    .then((response) => {
      let rolesPermissions = []
      for (let data of response.data) {
        let rolePermission = {
          roleId: data.roleId,
          permissionId: data.permissionId
        }
        rolesPermissions.push(rolePermission)
      }
      return rolesPermissions
    })
    .catch(error => {
      console.log(error)
      throw new Error(error)
    })

  await Promise.all([users, groups, roles, permissions, groupsRoles, rolesPermissions])
    .then(value => {
      const [users, groups, roles, permissions, groupsRoles, rolesPermissions] = value

      // Assign group to users
      for (let user of users.values()) {
        const {groupId, roleId} = user
        let group = groups.get(groupId)
        let role = roles.get(roleId)
        user.group = group
        user.role = role
        // user.assignGroup(group)
        // user.assignRole(role)
      }
      // Assign roles to groups
      for (let groupRole of groupsRoles) {
        const {groupId, roleId} = groupRole
        // groups.get(groupId).assignToRole(roles.get(roleId))
        let group = groups.get(groupId)
        let role = roles.get(roleId)
        group.roles.set(role.id, role)
      }
      // Assign permissions to roles
      for (let rolePermission of rolesPermissions) {
        const {roleId, permissionId} = rolePermission
        let role = roles.get(roleId)
        let permission = permissions.get(permissionId)
        // role.assignToPermission(permission)
        role.permissions.set(permission.id, permission)
      }

      for (let user of users.values()) {
        usersList.push(user)
      }

      for (let role of roles.values()) {
        rolesList.push(role)
      }

      for (let group of groups.values()) {
        groupsList.push(group)
      }
    })
    .catch(error => console.log(error))
}
