const sessions = new Map()

function getSession(phone){
    return sessions.get(phone) || null
}

function setSession(phone, data){
    sessions.set(phone,data)
}

function clearSession(phone) {
  sessions.delete(phone);
}

module.exports = {
    getSession,
    setSession,
    clearSession
}