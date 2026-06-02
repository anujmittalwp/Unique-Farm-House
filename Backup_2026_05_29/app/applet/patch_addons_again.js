const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const replacement = `<div className="space-y-2 pt-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Available Add-ons</label>
          {pricingSettings?.addons && pricingSettings.addons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pricingSettings.addons.map((addon, idx) => {
              const selectedItem = selectedAddons.find(a => a.name === addon.name);
              const isSelected = !!selectedItem;
              return (
                <div 
                  key={idx}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest && (e.target as HTMLElement).closest('.addon-qty-btn')) return;
                    if (isSelected) {
                      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
                    } else {
                      setSelectedAddons([...selectedAddons, { ...addon, quantity: 1 }]);
                    }
                  }}
                  className={\`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer select-none \${
                    isSelected ? 'border-luxury-gold bg-luxury-gold/5 shadow-sm' : 'border-black/5 bg-luxury-cream hover:border-luxury-gold/50'
                  }\`}
                >
                  <div className="flex flex-col gap-1 w-full overflow-hidden mr-2">
                    <div className="flex items-center gap-3">
                      <div className={\`w-4 h-4 rounded border flex items-center justify-center shrink-0 \${
                        isSelected ? 'bg-luxury-gold border-luxury-gold' : 'border-luxury-dark/20'
                      }\`}>
                        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className="text-sm font-medium text-luxury-dark truncate" style={{wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2'}}>{addon.name}</span>
                    </div>
                    {isSelected && (addon.type === 'per_unit' || addon.type === 'per_unit_per_night') && (
                      <div className="pl-7 flex items-center gap-2 mt-1">
                        <button 
                          type="button"
                          className="addon-qty-btn w-5 h-5 rounded border border-luxury-dark/10 flex items-center justify-center text-luxury-dark hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-colors text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedItem && selectedItem.quantity > 1) {
                              setSelectedAddons(selectedAddons.map(a => a.name === addon.name ? { ...a, quantity: a.quantity - 1 } : a));
                            } else {
                              setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
                            }
                          }}
                        >-</button>
                        <span className="text-[10px] font-bold w-4 text-center">{selectedItem?.quantity || 1}</span>
                        <button 
                          type="button"
                          className="addon-qty-btn w-5 h-5 rounded border border-luxury-dark/10 flex items-center justify-center text-luxury-dark hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-colors text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAddons(selectedAddons.map(a => a.name === addon.name ? { ...a, quantity: (a.quantity || 1) + 1 } : a));
                          }}
                        >+</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                     <span className="text-[11px] font-bold text-luxury-gold">+₹{Number(addon.price).toLocaleString()}</span>
                     {addon.type === 'per_night' && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">/ night</span>}
                     {addon.type === 'per_unit' && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">/ unit</span>}
                     {addon.type === 'per_unit_per_night' && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">/ unit / nt</span>}
                     {(!addon.type || addon.type === 'flat') && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">flat</span>}
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
             <div className="text-xs text-luxury-dark/40 italic px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl">No add-ons available.</div>
          )}
        </div>`;

lines.splice(9855, 9924 - 9855 + 1, replacement);
fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('Modified add-ons logic.');
