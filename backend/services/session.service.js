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

let activeHandoffCustomer = null;

function getActiveHandoffCustomer() {
    return activeHandoffCustomer;
}

function setActiveHandoffCustomer(phone) {
    activeHandoffCustomer = phone;
}

function clearActiveHandoffCustomer() {
    activeHandoffCustomer = null;
}

module.exports = {
    getSession,
    setSession,
    clearSession,
    getActiveHandoffCustomer,
    setActiveHandoffCustomer,
    clearActiveHandoffCustomer
}