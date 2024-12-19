/**
 * 将输入的字符串颜色转换为标准哈希颜色格式。
 * @param color 输入的颜色字符串，可以是rgb、rgba、三位哈希(#fff)或六位哈希(#ffffff)等格式。
 * @returns 标准的六位哈希颜色字符串，例如：#000000。如果输入格式不合法，则返回默认颜色#000000。
 */
export const toHashColor = (color: string): string => {
    const defaultColor = "#000000";

    // 创建一个虚拟的 DOM 元素，用于解析颜色
    const div = document.createElement("div");
    div.style.color = color;

    // 如果颜色无效，浏览器会将其清空
    if (!div.style.color) {
        return defaultColor;
    }

    // 使用 getComputedStyle 获取标准化的颜色值
    document.body.appendChild(div);
    const computedColor = getComputedStyle(div).color;
    document.body.removeChild(div);

    // 解析为 RGB 格式，并转换为哈希颜色
    const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    const rgbMatch = computedColor.match(rgbRegex);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, "0")}`;
    }

    // 如果解析失败，返回默认颜色
    return defaultColor;
}