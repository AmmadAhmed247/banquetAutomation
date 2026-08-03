import api from "../api/api";

const addonService = {
  getAll: async () => {
    const res = await api.get("api/addon/getAddons");
    console.log(res.data);
    
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
};

export default addonService;