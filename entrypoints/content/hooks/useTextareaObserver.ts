import { useEffect } from "react";

const TEXTAREA_TAG = "textarea";
const TARGET_CLASS = "form-control";

/**
 * ノードがHTML要素かどうかを判定する型ガード
 */
const isElement = (node: Node): node is Element => {
  return node.nodeType === Node.ELEMENT_NODE;
};

/**
 * 要素がターゲットのtextareaかどうかをチェック
 */
const isTargetTextarea = (element: Element): element is HTMLTextAreaElement => {
  return (
    element.tagName.toLowerCase() === TEXTAREA_TAG &&
    element.className === TARGET_CLASS
  );
};

/**
 * 追加されたノードからターゲットのtextareaを見つけて処理
 */
const processAddedNodes = (
  addedNodes: NodeList,
  onTextareaFound: (textarea: HTMLTextAreaElement) => void,
): void => {
  for (const node of addedNodes) {
    if (isElement(node) && isTargetTextarea(node)) {
      onTextareaFound(node);
    }
  }
};

/**
 * MutationObserverのコールバック
 */
const createObserverCallback = (
  onTextareaFound: (textarea: HTMLTextAreaElement) => void,
) => {
  return (mutations: MutationRecord[]): void => {
    for (const mutation of mutations) {
      processAddedNodes(mutation.addedNodes, onTextareaFound);
    }
  };
};

/**
 * DOM内のtextarea要素を監視し、追加されたら通知するカスタムフック
 * form-controlクラスを持つtextarea要素が対象
 */
export const useTextareaObserver = (
  onTextareaFound: (textarea: HTMLTextAreaElement) => void,
): void => {
  useEffect(() => {
    const observer = new MutationObserver(
      createObserverCallback(onTextareaFound),
    );

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [onTextareaFound]);
};
