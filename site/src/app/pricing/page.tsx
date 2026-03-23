import { pricingPlans } from "@/lib/registry";

export default function PricingPage() {
  return (
    <section className="container pricing-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">定价</div>
          <h1>搜索免费，治理付费，升级路径清晰。</h1>
        </div>
        <p>
          定价结构遵循与 SkillSafe 相同的产品逻辑：
          发现功能免费，分发和策略管控作为付费层。
        </p>
      </div>

      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <article key={plan.name} className="pricing-card">
            <div className="eyebrow">{plan.name}</div>
            <strong>{plan.price}</strong>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
