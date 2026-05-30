"use client"

import { useState } from "react"

export default function NotificationsPage() {
  const [telegramToken, setTelegramToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [email, setEmail] = useState("")
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [costSpike, setCostSpike] = useState(true)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-[14px] bg-white p-4"
        style={{ boxShadow: "oklab(0.145 -0.00000143796 0.00000340492 / 0.1) 0px 0px 0px 1px" }}
      >
        <p className="mb-4 text-sm font-medium text-[#000000]">Telegram</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#0a0a0a]">Bot token</label>
            <input
              type="text"
              placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              className="rounded-[10px] border border-[#e5e5e5] bg-transparent px-[10px] py-[4px] text-sm text-[#0a0a0a] outline-none placeholder:text-[#737373] focus:border-[#000000] transition-colors h-9"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#0a0a0a]">Chat ID</label>
            <input
              type="text"
              placeholder="-1001234567890"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="rounded-[10px] border border-[#e5e5e5] bg-transparent px-[10px] py-[4px] text-sm text-[#0a0a0a] outline-none placeholder:text-[#737373] focus:border-[#000000] transition-colors h-9"
            />
          </div>
          <button className="w-fit rounded-[9999px] border border-[#e5e5e5] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f2f2f2] transition-colors">
            Send test message
          </button>
        </div>
      </div>

      <div
        className="rounded-[14px] bg-white p-4"
        style={{ boxShadow: "oklab(0.145 -0.00000143796 0.00000340492 / 0.1) 0px 0px 0px 1px" }}
      >
        <p className="mb-4 text-sm font-medium text-[#000000]">Email</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#0a0a0a]">Email address</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[10px] border border-[#e5e5e5] bg-transparent px-[10px] py-[4px] text-sm text-[#0a0a0a] outline-none placeholder:text-[#737373] focus:border-[#000000] transition-colors h-9 max-w-sm"
          />
        </div>
      </div>

      <div
        className="rounded-[14px] bg-white p-4"
        style={{ boxShadow: "oklab(0.145 -0.00000143796 0.00000340492 / 0.1) 0px 0px 0px 1px" }}
      >
        <p className="mb-4 text-sm font-medium text-[#000000]">Alert preferences</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0a0a0a]">Weekly cost report</p>
              <p className="text-xs text-[#737373]">Receive a weekly summary of AI costs and trends</p>
            </div>
            <button
              onClick={() => setWeeklyReport((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                weeklyReport ? "bg-[#000000]" : "bg-[#e5e5e5]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                  weeklyReport ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="h-px bg-[#f2f2f2]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0a0a0a]">Cost spike alerts</p>
              <p className="text-xs text-[#737373]">Get notified when AI costs spike unexpectedly</p>
            </div>
            <button
              onClick={() => setCostSpike((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                costSpike ? "bg-[#000000]" : "bg-[#e5e5e5]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                  costSpike ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="h-9 rounded-[10px] bg-[#000000] px-6 text-sm font-medium text-white hover:opacity-80 transition-opacity"
        >
          {saved ? "Saved!" : "Save settings"}
        </button>
      </div>
    </div>
  )
}
