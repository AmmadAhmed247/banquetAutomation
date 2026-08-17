import api from "../api/api";

const addonService = {
  getAll: async () => {
    const res = await api.get("api/addon/getAddons");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("api/addon/addAddon", data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`api/addon/deleteAddon/${id}`);
    return res.data;
  },
  markReceived: async (id, payload = {}) => {
  const res = await api.patch(`api/addon/markReceived/${id}`, payload);
  return res.data;
},
  update: async (id, data) => {
    const res = await api.put(`api/addon/updateAddon/${id}`, data);
    return res.data;
  },
};

export default addonService;

