const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    if (activeFilter === 'users' && (userRole === 'admin' || userRole === 'agent')) {
      if (!user) return;
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAppUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));
      return () => unsubscribe();
    }`;

const rep = target + `
    if (activeFilter === 'coupons' && (userRole === 'admin' || userRole === 'agent')) {
      const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'coupons'));
      return () => unsubscribe();
    }`;

if (code.includes(target)) {
  code = code.replace(target, rep);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Added coupons fetch block');
} else {
  console.log('Target not found');
}
