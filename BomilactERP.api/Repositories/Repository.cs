using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Data;

namespace BomilactERP.api.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly BomilactDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(BomilactDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<T> CreateAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await SaveChangesAsync();
        return entity;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null)
            return false;

        // EF Core's Remove will trigger soft delete via SaveChangesAsync override
        _dbSet.Remove(entity);
        await SaveChangesAsync();
        return true;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
