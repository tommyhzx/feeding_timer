export interface KeyProps {
  name: string;
  pcbX?: number;
  pcbY?: number;
  pcbRotation?: string;
  schX?: number;
  schY?: number;
}

/**
 * Keyboard switch with hot-socket footprint
 * 使用 switch 组件显示原理图符号
 * 无坐标参数时使用自动布局
 */
export const Key = ({
  name,
  pcbX,
  pcbY,
  pcbRotation,
  schX,
  schY,
}: KeyProps) => {
  const hasCustomPosition =
    pcbX !== undefined ||
    pcbY !== undefined ||
    pcbRotation !== undefined ||
    schX !== undefined ||
    schY !== undefined;

  const groupProps: any = {};
  if (pcbX !== undefined) groupProps.pcbX = pcbX;
  if (pcbY !== undefined) groupProps.pcbY = pcbY;
  if (pcbRotation !== undefined) groupProps.pcbRotation = pcbRotation;
  if (schX !== undefined) groupProps.schX = schX;
  if (schY !== undefined) groupProps.schY = schY;

  const switchElement = (
    <switch
      name={name}
      type="spst"
      footprint={
        <footprint>
          {/* 丝印外轮廓 - 14.01mm x 15.5mm */}
          <silkscreenpath route={[
            {"x": -7.005, "y": -7.75},
            {"x": 7.005, "y": -7.75},
            {"x": 7.005, "y": 7.75},
            {"x": -7.005, "y": 7.75},
            {"x": -7.005, "y": -7.75}
          ]} />
          {/* 中心开孔 - 直径4mm */}
          <hole pcbX="0" pcbY="0" diameter="4mm" />
          {/* 引脚1 - 底部偏右 (插件矩形焊盘) */}
          <platedhole
            portHints={["pin1"]}
            pcbX="2.54mm"
            pcbY="-5.08mm"
            shape="circular_hole_with_rect_pad"
            holeDiameter="1.5mm"
            rectPadWidth="2mm"
            rectPadHeight="2mm"
          />
          {/* 引脚2 - 引脚1上方偏左，更靠近中线 (插件矩形焊盘) */}
          <platedhole
            portHints={["pin2"]}
            pcbX="-3.81mm"
            pcbY="-2.54mm"
            shape="circular_hole_with_rect_pad"
            holeDiameter="1.5mm"
            rectPadWidth="2mm"
            rectPadHeight="2mm"
          />
        </footprint>
      }
    />
  );

  // Only wrap in group if there are custom position props
  if (hasCustomPosition) {
    return <group {...groupProps}>{switchElement}</group>;
  }
  return switchElement;
};