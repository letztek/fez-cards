import { useState, useEffect, useRef, useMemo } from 'react';

interface CardSize {
  width: number;
  height: number;
}

interface UseCardLayoutOptions {
  cardCount: number;
  maxCardsPerRow: number;
  containerPadding?: number;
  cardGap?: number;
  minCardWidth?: number;
  maxCardWidth?: number;
  cardAspectRatio?: number; // height/width ratio
}

export const useCardLayout = ({
  cardCount,
  maxCardsPerRow,
  containerPadding = 16,
  cardGap = 16,
  minCardWidth = 80,
  maxCardWidth = 200,
  cardAspectRatio = 2.78 // Default based on existing card dimensions (334/120)
}: UseCardLayoutOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // 監聽容器尺寸變化
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 計算最佳佈局
  const layout = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) {
      return {
        cardSize: { width: minCardWidth, height: minCardWidth * cardAspectRatio },
        gridCols: Math.min(maxCardsPerRow, cardCount),
        gridRows: Math.ceil(cardCount / maxCardsPerRow)
      };
    }

    // 計算網格尺寸
    const actualCols = Math.min(maxCardsPerRow, cardCount);
    const actualRows = Math.ceil(cardCount / actualCols);
    
    // 計算可用空間 (扣除 padding 和 gaps)
    const availableWidth = containerSize.width - (containerPadding * 2) - (cardGap * (actualCols - 1));
    const availableHeight = containerSize.height - (containerPadding * 2) - (cardGap * (actualRows - 1));
    
    // 基於寬度計算卡牌尺寸
    const cardWidthFromContainer = availableWidth / actualCols;
    const cardHeightFromWidth = cardWidthFromContainer * cardAspectRatio;
    
    // 基於高度計算卡牌尺寸
    const cardHeightFromContainer = availableHeight / actualRows;
    const cardWidthFromHeight = cardHeightFromContainer / cardAspectRatio;
    
    // 選擇較小的尺寸確保兩個方向都不會溢出
    let finalCardWidth = Math.min(cardWidthFromContainer, cardWidthFromHeight);
    let finalCardHeight = finalCardWidth * cardAspectRatio;
    
    // 應用最小/最大限制，針對小螢幕進一步壓縮
    const screenHeight = window.innerHeight;
    const isSmallScreen = screenHeight < 900;
    
    // 在小螢幕上進一步限制最大尺寸
    const effectiveMaxWidth = isSmallScreen ? Math.min(maxCardWidth * 0.8, maxCardWidth) : maxCardWidth;
    
    finalCardWidth = Math.max(minCardWidth, Math.min(effectiveMaxWidth, finalCardWidth));
    finalCardHeight = finalCardWidth * cardAspectRatio;
    
    return {
      cardSize: { 
        width: Math.floor(finalCardWidth), 
        height: Math.floor(finalCardHeight) 
      },
      gridCols: actualCols,
      gridRows: actualRows,
      totalWidth: (finalCardWidth * actualCols) + (cardGap * (actualCols - 1)),
      totalHeight: (finalCardHeight * actualRows) + (cardGap * (actualRows - 1))
    };
  }, [
    containerSize, 
    cardCount, 
    maxCardsPerRow, 
    containerPadding, 
    cardGap, 
    minCardWidth, 
    maxCardWidth, 
    cardAspectRatio
  ]);

  return {
    containerRef,
    layout,
    containerSize
  };
};