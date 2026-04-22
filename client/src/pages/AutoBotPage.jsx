import { useState } from "react";
import { INIT_RULES } from "../data/mockData";
import { Zap } from "lucide-react";
export default function AutoBot({ showToast }) {
  const [rules, setRules] = useState(INIT_RULES);

  const toggle = (id) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      )
    );
    showToast("Rule updated");
  };

  const update = (id, field, val) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, [field]: val } : r
      )
    );
  };

  return (
    <div className="p-8">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">
            Auto Reply Bot
          </h1>
          <p className="text-slate-400 text-sm">
            WhatsApp keyword triggers via Twilio
          </p>
        </div>

        <button
          onClick={() => {
            setRules((prev) => [
              ...prev,
              {
                id: Date.now(),
                trigger: "Custom Trigger",
                keyword: "",
                response: "",
                active: true,
                type: "custom",
              },
            ]);
            showToast("New rule added");
          }}
          className="px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition"
        >
          + Add Rule
        </button>
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-green-50 border border-green-200 rounded-2xl p-5 ${
              !rule.active ? "opacity-60" : ""
            }`}
          >
            <div className="flex gap-4">

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                <Zap  className="text-emerald-500  "   size={20}  />
              </div>

              {/* Inputs */}
              <div className="flex-1">
                <input
                  value={rule.trigger}
                  onChange={(e) =>
                    update(rule.id, "trigger", e.target.value)
                  }
                  className="w-full mb-2 text-base font-semibold bg-transparent border-none outline-none"
                />

                <textarea
                  value={rule.response}
                  onChange={(e) =>
                    update(rule.id, "response", e.target.value)
                  }
                  rows={3}
                  className="w-full p-3 rounded-xl border border-green-100 resize-y focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggle(rule.id)}
                className={`w-12 h-6 rounded-full relative transition ${
                  rule.active
                    ? "bg-emerald-500"
                    : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all ${
                    rule.active
                      ? "left-6"
                      : "left-[3px]"
                  }`}
                />
              </button>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}