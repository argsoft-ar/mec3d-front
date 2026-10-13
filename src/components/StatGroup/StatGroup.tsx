import Card from "../Card/Card";
import MaterialTag from "../MaterialTag/MaterialTag";
import type { StatGroupProps } from "./StatGroup.types";
import "./StatGroup.css";

function StatGroup({ items, className = "" }: Readonly<StatGroupProps>) {
  return (
    <div className={`stat-group ${className}`.trim()}>
      {items.map((item) => (
        <Card
          key={item.key}
          icon={item.icon}
          title={item.label}
          variant="default"
          disableHover
        >
          <div className="stat-group__value">{item.value}</div>
          {item.badge && (
            <MaterialTag
              label={item.badge.label}
              variant={item.badge.variant}
              size="sm"
            />
          )}
          {item.caption && <p className="stat-group__caption">{item.caption}</p>}
        </Card>
      ))}
    </div>
  );
}

export default StatGroup;
