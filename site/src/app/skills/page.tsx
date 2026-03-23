"use client";

import { useDeferredValue, useState } from "react";

import { SkillCard } from "@/components/skill-card";
import { registrySkills } from "@/lib/registry";

export default function SkillsPage() {
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("q") ?? "";
  });
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [verification, setVerification] = useState("");

  const deferredQuery = useDeferredValue(query);

  const filtered = registrySkills.filter((skill) => {
    const needle = deferredQuery.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      skill.name.toLowerCase().includes(needle) ||
      skill.publisher.toLowerCase().includes(needle) ||
      skill.summary.toLowerCase().includes(needle) ||
      skill.repoUrl.toLowerCase().includes(needle);

    const matchesCategory = !category || skill.category === category;
    const matchesType = !type || skill.type === type;
    const matchesVerification = !verification || skill.verification === verification;

    return matchesQuery && matchesCategory && matchesType && matchesVerification;
  });

  const categories = Array.from(new Set(registrySkills.map((skill) => skill.category)));

  return (
    <section className="container skills-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">技能库</div>
          <h1>浏览已验证的 Agent 技能和待导入候选。</h1>
        </div>
        <p>
          按名称搜索或粘贴 GitHub URL。这是 SkillSafe 风格的注册表视图，
          使用与首页相同的深色搜索界面渲染。
        </p>
      </div>

      <div className="filters-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索技能或粘贴仓库 URL"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">所有分类</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">所有类型</option>
          <option value="skill">技能</option>
          <option value="skillset">技能集</option>
        </select>
        <select value={verification} onChange={(event) => setVerification(event.target.value)}>
          <option value="">所有状态</option>
          <option value="verified">已验证</option>
          <option value="divergent">已偏离</option>
          <option value="critical">高危</option>
        </select>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">信任横幅</div>
            <h2>所有列出的技能都有保存的扫描历史。</h2>
          </div>
          <p>
            注册表区分发布者判定和消费者重放状态，这是核心的产品行为。
          </p>
        </div>
      </div>

      <div className="skills-grid stacked-section">
        {filtered.map((skill) => (
          <SkillCard key={`${skill.publisher}-${skill.slug}`} skill={skill} />
        ))}
      </div>
    </section>
  );
}
