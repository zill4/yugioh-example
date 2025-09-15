import React from 'react';
import type { BaseCard } from '../types/Card';
import CardItem from './CardItem';

interface CardListProps {
  cards: BaseCard[];
}

const CardList: React.FC<CardListProps> = ({ cards }) => {
  if (cards.length === 0) {
    return (
      <div enable-xr className="text-center py-16">
        <div enable-xr className="text-6xl mb-6 text-slate-500">◈</div>
        <h3 enable-xr className="text-xl font-bold text-slate-300 mb-3 tracking-wider">NO CARDS FOUND</h3>
        <p enable-xr className="text-slate-400 font-medium">Adjust your search filters to discover premium cards</p>
      </div>
    );
  }

  return (
    <div enable-xr className="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {cards.map(card => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
};

export default CardList;
