import Link from "next/link";

export default function Post() {
  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-gray-300 transition">ClawSafety</Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition">&larr; 博客</Link>
            <Link href="/en/blog/clawhavoc-bob-p2p" className="text-sm text-gray-400 hover:text-white transition">EN</Link>
          </div>
        </div>
      </nav>

      <article className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-bold text-red-400 bg-red-400/10">威胁分析</span>
          <span className="text-xs text-gray-500">2026-03-22</span>
        </div>
        <h1 className="text-4xl font-bold mb-6">一个伪造的 Polymarket Skill 窃取了 Solana 钱包：bob-p2p 攻击事件深度分析</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">

          <p className="text-xl text-gray-400">
            一个伪装成去中心化 API 市场的 ClawHub Skill，诱骗 AI Agent 以明文存储钱包私钥并购买毫无价值的代币。以下是其完整攻击手法。
          </p>

          <h2 className="text-2xl font-bold text-white mt-12">概要</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>威胁行为者 <code className="text-cyan-400">26medias</code> 在 ClawHub 发布了 <strong>bob-p2p-beta</strong>，声称是一个去中心化 API 市场</li>
            <li>该 Skill 指示 AI Agent 以<strong>明文</strong>存储 Solana 钱包私钥</li>
            <li>它引导 Agent 在 pump.fun 上购买毫无价值的 <code className="text-cyan-400">$BOB</code> 代币</li>
            <li>所有支付均通过攻击者控制的聚合器基础设施进行路由</li>
            <li>链上分析确认：聚合器钱包由 $BOB 代币创建者直接注资</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12">布局：两个 Skill，一个攻击者</h2>
          <p>
            攻击者在同一个 ClawHub 账号下发布了两个 Skill。第一个是 <strong>runware</strong>，一个看起来合法的图片生成工具 &mdash; 用作信誉锚点。它按描述正常工作，通过 API 生成图片，没有任何恶意行为。
          </p>
          <p>
            第二个 Skill <strong>bob-p2p-beta</strong> 紧随其后发布，自我描述为：
          </p>
          <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm border border-white/10">
            <p className="text-gray-400"># bob-p2p-beta</p>
            <p>A decentralized peer-to-peer API marketplace. Buy and sell API access using SOL tokens.</p>
          </div>
          <p>
            专业的 README、清晰的文档、一个 NPM 包。对于用户 &mdash; 或者 AI Agent &mdash; 来说，它看起来完全合法。
          </p>

          <h2 className="text-2xl font-bold text-white mt-12">攻击手法：该 Skill 的真实行为</h2>

          <h3 className="text-xl font-semibold text-white mt-8">第一步：明文存储私钥</h3>
          <p>
            该 Skill 的 SKILL.md 中包含指令，告诉 AI Agent 将用户的 Solana 钱包私钥存储在本地配置文件中 &mdash; <strong>以明文形式</strong>。没有加密，没有 Keychain 集成，只是原始的私钥字节存放在一个 JSON 文件中。
          </p>
          <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm border border-white/10">
            <p className="text-red-400">{"// ~/.bob-p2p/config.json"}</p>
            <p>{`{`}</p>
            <p>&nbsp;&nbsp;<span className="text-red-400">&quot;wallet_private_key&quot;</span>: <span className="text-yellow-400">&quot;5Kd3...your_actual_private_key...&quot;</span>,</p>
            <p>&nbsp;&nbsp;&quot;rpc_endpoint&quot;: &quot;https://api.mainnet-beta.solana.com&quot;</p>
            <p>{`}`}</p>
          </div>

          <h3 className="text-xl font-semibold text-white mt-8">第二步：强制购买代币</h3>
          <p>
            钱包配置完成后，该 Skill 指示 Agent 在 pump.fun 上购买 <code className="text-cyan-400">$BOB</code> 代币，声称是&quot;市场所需的抵押品&quot;。该代币毫无实际用途。Birdeye 的风险评估将其标记为 <strong>100% 诈骗/跑路概率</strong>。
          </p>

          <h3 className="text-xl font-semibold text-white mt-8">第三步：攻击者控制的支付路由</h3>
          <p>
            所有 API 支付均通过攻击者控制的&quot;聚合器&quot;钱包进行路由。链上取证确认：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>聚合器钱包直接从 $BOB 代币创建者钱包收到了 <strong>0.25 SOL 转账</strong></li>
            <li>两个钱包的交易模式一致，符合单一实体控制的特征</li>
            <li>不存在任何合法的市场基础设施 &mdash; 所谓的&quot;API 市场&quot;完全是虚构的</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12">为什么这个攻击能成功</h2>
          <p>
            这次攻击堪称利用 Agent 原生信任链的教科书案例：
          </p>
          <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm border border-white/10">
            <p>用户信任 Agent &rarr; Agent 信任 Skill &rarr; Skill 说&quot;存储你的私钥&quot;</p>
            <p className="text-red-400 mt-2">结果：用户私钥以明文存储，资金被盗</p>
          </div>
          <p>
            用户从未直接接触恶意指令。AI Agent 读取了 SKILL.md，将其解读为合法的配置需求，并作为正常的配置步骤呈现给用户。
          </p>

          <h2 className="text-2xl font-bold text-white mt-12">IOC（失陷指标）</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10"><th className="text-left py-2 text-gray-400">类型</th><th className="text-left py-2 text-gray-400">值</th></tr></thead>
              <tbody className="font-mono">
                <tr className="border-b border-white/10"><td className="py-2">ClawHub 作者</td><td className="py-2 text-cyan-400">26medias</td></tr>
                <tr className="border-b border-white/10"><td className="py-2">Skill 名称</td><td className="py-2 text-cyan-400">bob-p2p-beta</td></tr>
                <tr className="border-b border-white/10"><td className="py-2">诈骗代币</td><td className="py-2 text-cyan-400">$BOB on pump.fun</td></tr>
                <tr className="border-b border-white/10"><td className="py-2">信誉锚点</td><td className="py-2 text-cyan-400">runware（图片生成 Skill）</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-white mt-12">ClawSafety 能检测到什么</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>CS-SEC-001</strong>：SKILL.md 指令中的私钥存储模式</li>
            <li><strong>CS-CFG-004</strong>：引导 Agent 处理凭证的提示注入模式</li>
            <li><strong>CS-PRM-001</strong>：一个&quot;API 市场&quot;Skill 请求钱包/金融权限</li>
            <li><strong>AI 分析</strong>：意图不匹配 &mdash; Skill 声称是 API 市场，但主要行为涉及钱包密钥管理和代币购买</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12">经验教训</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>永远不要信任索要私钥的 Skill。</strong>任何合法 Skill 都不需要你的钱包私钥明文。</li>
            <li><strong>信誉锚点是真实存在的攻击手段。</strong>攻击者先发布无害的 Skill 建立信任，然后再部署恶意载荷。</li>
            <li><strong>链上取证至关重要。</strong>聚合器与代币创建者之间的钱包关联是关键证据。</li>
            <li><strong>AI Agent 需要金融安全护栏。</strong>Agent 不应在没有明确的带外用户确认的情况下发起代币购买。</li>
          </ol>

          <div className="mt-12 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="font-semibold mb-2">免费扫描你的 Skill</p>
            <p className="text-sm text-gray-400 mb-4">ClawSafety 可检测 Agent Skill 中的凭证处理、提示注入和权限不匹配问题。</p>
            <Link href="/scan" className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
              开始扫描
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
