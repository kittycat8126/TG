// useBotnet.js — manages BotnetClusters lifecycle
import { useRef, useState, useCallback } from "react";
import { BotnetClusters } from "../attacks/BotnetClusters";

export function useBotnet(sceneRef) {
  const botnetRef = useRef(null);
  const [activeClusters, setActiveClusters] = useState([]);
  const [visible, setVisible] = useState(true);

  const initBotnet = useCallback((sceneData) => {
    if (botnetRef.current) return;
    botnetRef.current = new BotnetClusters(sceneData);
  }, []);

  const tickBotnet = useCallback(() => {
    if (!botnetRef.current) return;
    botnetRef.current.tick();
    if (Math.random() < 0.02) {
      setActiveClusters(botnetRef.current.getActiveClusters());
    }
  }, []);

  const registerAttack = useCallback((event) => {
    botnetRef.current?.registerAttack(event);
  }, []);

  function toggleBotnet() {
    const next = !visible;
    setVisible(next);
    botnetRef.current?.setVisible(next);
  }

  return { initBotnet, tickBotnet, registerAttack, activeClusters, visible, toggleBotnet };
}